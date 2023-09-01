import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsStrongPassword } from 'class-validator';
import { IsValidAuth0Token } from './auth.validator';

export class AuthByAuth0Request {
  @IsValidAuth0Token()
  idToken: string;
}

// TODO: Improve error message for IsStrongPassword validator.
const passwordRuleDescription = `
  The password must be validated by the following conditions. \n
  - contains at least one lower character \n
  - contains at least one upper character \n
  - contains at least one digit character \n
  - contains at least one special character \n
  - contains at least 8 characters
`;

export const passwordRules = {
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
  minLength: 8,
};

export class RegisterRequest {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: passwordRuleDescription })
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

export class ResetPasswordRequest {
  @ApiProperty({ description: passwordRuleDescription })
  @IsStrongPassword(passwordRules)
  oldPassword: string;

  @ApiProperty({ description: passwordRuleDescription })
  @IsStrongPassword(passwordRules)
  newPassword: string;
}
