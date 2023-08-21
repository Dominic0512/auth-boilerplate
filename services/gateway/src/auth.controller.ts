import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseInterceptors,
  Inject,
  Get,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request } from 'express';

import { ApiBadRequestException, ApiForbiddenException, ApiUnauthorizedException } from './common/swagger';
import { AuthService } from './auth/auth.service';
import { RequestWithCurrentUser } from './auth/auth.middleware';
import { ApiBearAuthWithRoles } from './auth/auth.decorator';
import { EmailVerificationTokenPayload, RefreshTokenPayload, RoleEnum } from './auth/auth.type';
import { TokenResponse } from './auth/auth.response';
import { LoginRequest, AuthByIdTokenRequest, RegisterRequest, VerifyRequest, ResetPasswordRequest } from './auth/auth.request';
import { AuthInterceptor } from './auth/auth.interceptor';

export enum UserStateEnum {
  Pending = 'Pending',
  Verified = 'Verified',
}

@ApiTags('auth')
@Controller()
@UseInterceptors(AuthInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  @Post('/register')
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
      verifyToken: this.authService.generateToken<EmailVerificationTokenPayload>({ email })
    }));
  }

  @Post('/verify')
  @ApiUnauthorizedException()
  async verify(@Body() { token }: VerifyRequest): Promise<TokenResponse> {
    const { email } = this.authService.decodeToken<{ email: string }>(token);
    const { id, role } = await firstValueFrom(this.userServiceClient.send('USER_VERIFY_BY_EMAIL', { email }));
    return {
      accessToken: this.authService.generateAccessToken({ id, role }),
      refreshToken: this.authService.generateRefreshToken({ id })
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
      accessToken: this.authService.generateAccessToken({ id, role }),
      refreshToken: this.authService.generateRefreshToken({ id })
    };
  }

  @Post('/auth-by-id-token')
  @ApiCreatedResponse({ type: TokenResponse, description: "Sign up successfully." })
  @ApiBadRequestException()
  async authByIdToken(@Body() { idToken }: AuthByIdTokenRequest): Promise<TokenResponse> {
    const { email, provider, picture, name } = this.authService.decodeAuth0Token(idToken);

    const { id, role } = await firstValueFrom(this.userServiceClient.send('USER_UPSERT_WITH_PROVIDER', {
      name,
      email,
      providers: [{
        name: provider,
        picture,
      }]
    }));

    return {
      accessToken: this.authService.generateAccessToken({ id, role }),
      refreshToken: this.authService.generateRefreshToken({ id })
    };
  }

  @Post('/refresh-token')
  @ApiForbiddenException()
  async refreshToken(@Req() req: Request): Promise<TokenResponse> {
    const refreshToken = req.cookies.refreshToken;
    const { success, message } = this.authService.verifyPrimaryRefreshToken(refreshToken);

    if (!success) throw new ForbiddenException(message);

    const { id } = this.authService.decodeToken<RefreshTokenPayload>(refreshToken);
    const { role } = await firstValueFrom(this.userServiceClient.send('USER_GET_BY_ID', { id }));

    return {
      accessToken: this.authService.generateAccessToken({ id, role }),
      refreshToken: this.authService.generateRefreshToken({ id })
    };
  }

  @Post('/reset-password')
  @ApiBearAuthWithRoles([RoleEnum.User, RoleEnum.Admin])
  @ApiUnauthorizedException()
  @ApiBadRequestException()
  async resetPassword(@Req() req: RequestWithCurrentUser, @Body() resetPasswordRequest: ResetPasswordRequest) {
    const { id } = req.currentUser;
    const { password, passwordSalt } = await firstValueFrom(this.userServiceClient.send('USER_GET_BY_ID', { id }));
    const { oldPassword, newPassword } = resetPasswordRequest;
    const hashOldPassword = this.authService.hashPasswordFactory(oldPassword, passwordSalt);

    if (hashOldPassword !== password) {
      throw new UnauthorizedException('Invalid old password.');
    }

    const newHashPassword = this.authService.hashPasswordFactory(newPassword, passwordSalt );

    return await firstValueFrom(this.userServiceClient.send('USER_RESET_PASSWORD', { id, newHashPassword }));
  }

  @Get('/me')
  @ApiBearAuthWithRoles([RoleEnum.User, RoleEnum.Admin])
  @ApiUnauthorizedException()
  @ApiForbiddenException()
  async me(@Req() req: RequestWithCurrentUser) {
    const { id } = req.currentUser;
    return await firstValueFrom(this.userServiceClient.send('USER_GET_BY_ID', { id }));
  }
}
