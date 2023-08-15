import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

import { passwordRules } from './user.dto';
import { RegisterByAuth0Request, LoginByAuth0Request } from '../auth/auth.request'

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

export class LoginRequest extends RegisterRequest {}


export class RegisterByIdTokenRequest extends RegisterByAuth0Request {
  @ApiProperty()
  idToken: string;
}
export class LoginByIdTokenRequest extends LoginByAuth0Request {}