import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

import { passwordRules } from './user.dto';
import { AuthByAuth0Request } from '../auth/auth.request'

export class RegisterRequest  {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: `
      The password must be validated by the following conditions. \n
      - contains at least one lower character \n
      - contains at least one upper character \n
      - contains at least one digit character \n
      - contains at least one special character \n
      - contains at least 8 characters
    `
  })
  @IsStrongPassword(passwordRules)
  password: string;
}

export class VerifyRequest {
  @ApiProperty()
  token: string;
}

export class LoginRequest extends RegisterRequest {}


export class AuthByIdTokenRequest extends AuthByAuth0Request {
  @ApiProperty()
  idToken: string;
}
