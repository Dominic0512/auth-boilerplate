import { BadRequestException, Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';

import { ApiBadRequestException, ApiUnauthorizedException } from '../common/swagger';
import { AuthService } from '../auth/auth.service';
import { LoginRequest, AuthByIdTokenRequest, RegisterRequest, VerifyRequest } from './user.request';
import { TokenResponse } from './user.response';
import { UserService } from './user.service';
import { User, UserStateEnum } from './entities/user.entity';

export interface CurrentUser {
  id: number,
  email: string,
  isRevoke?: boolean,
}

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
  @ApiBadRequestException()
  async register(@Body() { email, password }: RegisterRequest): Promise<Partial<User>> {
    const user = await this.userService.findOneByEmail(email);

    if (user) {
      throw new BadRequestException(`The email ${email} is exists.`);
    }

    return await this.userService.createWithPassword({
      name: email.slice(0, email.indexOf('@')),
      email,
      password,
      token: this.authService.generateAuthToken({ email })
    });
  }

  @Post('/verify')
  @ApiUnauthorizedException()
  async verify(@Body() { token }: VerifyRequest): Promise<TokenResponse> {
    const { email } = this.authService.decodeToken<{ email: string }>(token);
    const { id } = await this.userService.verifyByEmail(email);
    return {
      token: this.authService.generateAuthToken({ id, email })
    };
  }

  @Post('/login')
  @ApiBadRequestException()
  @ApiUnauthorizedException()
  async login(@Body() { email, password }: LoginRequest): Promise<TokenResponse> {
    const { id, state, password: originPassword, passwordSalt } = await this.userService.findOneByEmail(email);

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
      token: this.authService.generateAuthToken({ id, email })
    };
  }

  @Post('/auth-by-id-token')
  @ApiCreatedResponse({ type: TokenResponse, description: "Sign up successfully." })
  @ApiBadRequestException()
  async authByIdToken(@Body() { idToken }: AuthByIdTokenRequest): Promise<TokenResponse> {
    const { email, emailVerified, sub, picture } = this.authService.decodeAuth0Token(idToken);

    if (!emailVerified) {
      throw new BadRequestException('The email is not verified. Please complete the verification step, then sign up again.');
    }

    const user = await this.userService.upsertWithProvider({
      name: email.slice(0, email.indexOf('@')),
      email,
      providers: [{
        name: this.userService.transformProvider(sub.slice(0, sub.indexOf('|')).toUpperCase()),
        picture,
      }]
    });

    return {
      token: this.authService.generateAuthToken({ id: user.id, email })
    };
  }
}
