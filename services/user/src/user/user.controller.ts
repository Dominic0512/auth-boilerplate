import { BadRequestException, Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';

import { ApiBadRequestException, ApiUnauthorizedException } from '../common/swagger';
import { AuthService } from '../auth/auth.service';
import { LoginByIdTokenRequest, LoginRequest, RegisterByIdTokenRequest, RegisterRequest } from './user.request';
import { TokenResponse } from './user.response';
import { UserService } from './user.service';

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
  async register(@Body() { email, password }: RegisterRequest): Promise<TokenResponse> {
    const { id } = await this.userService.createWithPassword({
      name: email.slice(0, email.indexOf('@')),
      email,
      password
    });

    return {
      token: this.authService.generateAuthToken({ id, email }, 24 * 60 * 60)
    };
  }

  @Post('/login')
  @ApiBadRequestException()
  @ApiUnauthorizedException()
  async login(@Body() { email, password }: LoginRequest): Promise<TokenResponse> {
    const { id, password: originPassword, passwordSalt } = await this.userService.findOneByEmail(email);

    if (!id) {
      throw new BadRequestException(`The email ${email} is not found.`);
    }

    const hashPassword = this.userService.hashPasswordFactory(password, passwordSalt);

    if (hashPassword !== originPassword) {
      throw new UnauthorizedException('Invalid password.');
    }

    return {
      token: this.authService.generateAuthToken({ id, email }, 24 * 60 * 60)
    };
  }

  @Post('/register-by-id-token')
  @ApiCreatedResponse({ type: TokenResponse, description: "Sign up successfully." })
  @ApiBadRequestException()
  async registerByIdToken(@Body() { idToken }: RegisterByIdTokenRequest): Promise<TokenResponse> {
    const { email, emailVerified, sub, picture } = this.authService.decodeAuth0Token(idToken);

    if (!emailVerified) {
      throw new BadRequestException('The email is not verified. Please complete the verification step, then sign up again.');
    }

    const { id } = await this.userService.create({
      name: email.slice(0, email.indexOf('@')),
      email,
      providers: [{
        name: sub.slice(0, sub.indexOf('|')).toUpperCase(),
        picture,
      }]
    });

    return {
      token: this.authService.generateAuthToken({ id, email }, 24 * 60 * 60)
    };
  }

  @Post('/login-by-id-token')
  loginByIdToken(@Body() { idToken }: LoginByIdTokenRequest): Boolean {

    return true;
  }
}
