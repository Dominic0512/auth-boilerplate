import {
  BadRequestException,
  Request,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';

import { ApiBadRequestException, ApiForbiddenResourceException, ApiUnauthorizedException } from '../common/swagger';
import { AuthService } from '../auth/auth.service';
import { RequestWithCurrentUser } from '../auth/auth.middleware';
import { ApiBearAuthWithRoles } from '../auth/auth.decorator';
import { RoleEnum } from '../auth/auth.type';
import { LoginRequest, AuthByIdTokenRequest, RegisterRequest, VerifyRequest, ResetPasswordRequest } from './user.request';
import { TokenResponse } from './user.response';
import { UserService } from './user.service';
import { User, UserStateEnum } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}
  @Get()
  list(): string {
    return 'user list';
  }

  @Post('/register')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBadRequestException()
  async register(@Body() { email, password }: RegisterRequest): Promise<User> {
    const user = await this.userService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException(`The email ${email} is exists.`);
    }

    return new User(await this.userService.createWithPassword({
      name: email.slice(0, email.indexOf('@')),
      email,
      password,
      verifyToken: this.authService.generateAuthToken({ email })
    }));
  }

  @Post('/verify')
  @ApiUnauthorizedException()
  async verify(@Body() { token }: VerifyRequest): Promise<TokenResponse> {
    const { email } = this.authService.decodeToken<{ email: string }>(token);
    const { id, role} = await this.userService.verifyByEmail(email);
    return {
      token: this.authService.generateAuthToken({ id, email, role })
    };
  }

  @Post('/login')
  @ApiBadRequestException()
  @ApiUnauthorizedException()
  async login(@Body() { email, password }: LoginRequest): Promise<TokenResponse> {
    const { id, state, password: originPassword, passwordSalt, role } = await this.userService.findOneByEmail(email);

    if (!id) {
      throw new BadRequestException(`The email ${email} is not found.`);
    }

    if (state !== UserStateEnum.Verified) {
      throw new UnauthorizedException('Please complete the email verify step.');
    }

    const hashPassword = this.userService.hashPasswordFactory(password, passwordSalt);

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

    const user = await this.userService.upsertWithProvider({
      name,
      email,
      providers: [{
        name: this.userService.transformProvider(provider),
        picture,
      }]
    });

    return {
      token: this.authService.generateAuthToken({ id: user.id, email, role: user.role })
    };
  }

  @Get('/profile')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearAuthWithRoles([RoleEnum.User, RoleEnum.Admin])
  @ApiUnauthorizedException()
  @ApiForbiddenResourceException()
  async profile(@Request() req: RequestWithCurrentUser) {
    const { id } = req.currentUser;
    return new User(await this.userService.findOneById(id));
  }

  @Post('/reset-password')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearAuthWithRoles([RoleEnum.User, RoleEnum.Admin])
  @ApiUnauthorizedException()
  @ApiBadRequestException()
  async resetPassword(@Request() req: RequestWithCurrentUser, @Body() resetPasswordRequest: ResetPasswordRequest) {
    const { id } = req.currentUser;
    const { password, passwordSalt} = await this.userService.findOneById(id);
    const { oldPassword, newPassword } = resetPasswordRequest;
    const hashPassword = this.userService.hashPasswordFactory(oldPassword, passwordSalt);

    if (hashPassword !== password) {
      throw new UnauthorizedException('Invalid old password.');
    }

    return new User(await this.userService.updatePasswordById(id, newPassword));
  }
}
