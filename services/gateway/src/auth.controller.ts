import {
  BadRequestException,
  Request,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UnauthorizedException,
  UseInterceptors,
  Inject,
  Get,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { ApiBadRequestException, ApiForbiddenResourceException, ApiUnauthorizedException } from './common/swagger';
import { AuthService } from './auth/auth.service';
import { RequestWithCurrentUser } from './auth/auth.middleware';
import { ApiBearAuthWithRoles } from './auth/auth.decorator';
import { RoleEnum } from './auth/auth.type';
import { TokenResponse } from './auth/auth.response';
import { LoginRequest, AuthByIdTokenRequest, RegisterRequest, VerifyRequest, ResetPasswordRequest } from './auth/auth.request';

export enum UserStateEnum {
  Pending = 'Pending',
  Verified = 'Verified',
}

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  @Post('/register')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBadRequestException()
  async register(@Body() { email, password }: RegisterRequest): Promise<any> {
    const user = await firstValueFrom(this.userServiceClient.send('USER_GET_BY_EMAIL', { email }));

    if (user) {
      throw new BadRequestException(`The email ${email} is exists.`);
    }

    return await firstValueFrom(this.userServiceClient.send('USER_CREATE_WITH_PASSWORD', {
      name: email.slice(0, email.indexOf('@')),
      email,
      ...this.authService.hashPasswordPairFactory(password),
      verifyToken: this.authService.generateAuthToken({ email })
    }));
  }

  @Post('/verify')
  @ApiUnauthorizedException()
  async verify(@Body() { token }: VerifyRequest): Promise<TokenResponse> {
    const { email } = this.authService.decodeToken<{ email: string }>(token);
    const { id, role } = await firstValueFrom(this.userServiceClient.send('USER_GET_BY_EMAIL', { email }));
    return {
      token: this.authService.generateAuthToken({ id, email, role })
    };
  }

  @Post('/login')
  @ApiBadRequestException()
  @ApiUnauthorizedException()
  async login(@Body() { email, password }: LoginRequest): Promise<TokenResponse> {
    const user = await firstValueFrom(this.userServiceClient.send('USER_GET_BY_EMAIL', { email }));

    if (!user) {
      throw new BadRequestException(`The email ${email} is not found.`);
    }

    const { id, state, password: originPassword, passwordSalt, role } = user;

    if (state !== UserStateEnum.Verified) {
      throw new UnauthorizedException('Please complete the email verify step.');
    }

    const hashPassword = this.authService.hashPasswordFactory(password, passwordSalt);

    if (hashPassword !== originPassword) {
      throw new UnauthorizedException('Invalid password.');
    }

    return {
      token: this.authService.generateAuthToken({ id, email, role })
    };
  }

  @Post('/auth-by-id-token')
  @ApiCreatedResponse({ type: TokenResponse, description: "Sign up successfully." })
  @ApiBadRequestException()
  async authByIdToken(@Body() { idToken }: AuthByIdTokenRequest): Promise<TokenResponse> {
    const { email, emailVerified, provider, picture, name } = this.authService.decodeAuth0Token(idToken);

    if (!emailVerified) {
      throw new BadRequestException('The email is not verified. Please complete the verification step, then sign up again.');
    }

    const user = await firstValueFrom(this.userServiceClient.send('USER_UPSERT_WITH_PROVIDER', {
      name,
      email,
      providers: [{
        name: provider,
        picture,
      }]
    }));

    return {
      token: this.authService.generateAuthToken({ id: user.id, email, role: user.role })
    };
  }

  @Post('/reset-password')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearAuthWithRoles([RoleEnum.User, RoleEnum.Admin])
  @ApiUnauthorizedException()
  @ApiBadRequestException()
  async resetPassword(@Request() req: RequestWithCurrentUser, @Body() resetPasswordRequest: ResetPasswordRequest) {
    const { id } = req.currentUser;
    const { password, passwordSalt } = await firstValueFrom(this.userServiceClient.send('GET_USER_BY_ID', { id }));
    const { oldPassword, newPassword } = resetPasswordRequest;
    const hashOldPassword = this.authService.hashPasswordFactory(oldPassword, passwordSalt);

    if (hashOldPassword !== password) {
      throw new UnauthorizedException('Invalid old password.');
    }

    const newHashPassword = this.authService.hashPasswordFactory(newPassword, passwordSalt );

    return await firstValueFrom(this.userServiceClient.send('USER_RESET_PASSWORD', { id, newHashPassword }));
  }

  @Get('/me')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearAuthWithRoles([RoleEnum.User, RoleEnum.Admin])
  @ApiUnauthorizedException()
  @ApiForbiddenResourceException()
  async me(@Request() req: RequestWithCurrentUser) {
    const { id } = req.currentUser;
    return await firstValueFrom(this.userServiceClient.send('USER_GET_BY_ID', { id }));
  }
}
