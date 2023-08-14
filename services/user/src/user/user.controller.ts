import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';

import { ApiBadRequestException, InternalServerErrorException } from '../common/swagger';
import { AuthService } from '../auth/auth.service';
import { UserSignUpRequest, UserSignInRequest } from './user.request';
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

  @Post('/signup')
  @ApiCreatedResponse({ type: TokenResponse, description: "Sign up successfully." })
  @ApiBadRequestException()
  @InternalServerErrorException()
  async signUp(@Body() { idToken }: UserSignUpRequest): Promise<TokenResponse> {
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

  @Post('/signin')
  signIn(@Body() { idToken }: UserSignInRequest): Boolean {

    return true;
  }
}
