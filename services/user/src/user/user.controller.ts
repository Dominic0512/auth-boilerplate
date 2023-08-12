import { Body, Controller, Get, Post } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { SignInRequest } from './requests/sign-in.request';
import { SignUpRequest } from './requests/sign-up.request';

@Controller('user')
export class UserController {
  @Get()
  list(): string {
    return 'user list';
  }

  @Post('/signup')
  signUp(@Body() signUpRequest: SignUpRequest): Boolean {
    const { idToken } = signUpRequest;
    const info = jwt.decode(idToken);
    return true;
  }

  @Post('/signin')
  signIn(@Body() signInRequest: SignInRequest): Boolean {
    return true;
  }
}
