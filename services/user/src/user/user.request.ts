import { ApiProperty } from "@nestjs/swagger";
import { RegisterByAuth0Request, LoginByAuth0Request } from '../auth/auth.request'

export class RegisterRequest {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export class LoginRequest extends RegisterRequest {}


export class RegisterByIdTokenRequest extends RegisterByAuth0Request {
  @ApiProperty()
  idToken: string;
}
export class LoginByIdTokenRequest extends LoginByAuth0Request {}