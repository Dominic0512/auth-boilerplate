import { ApiProperty } from "@nestjs/swagger";
import { SignUpRequest, SignInRequest } from '../auth/auth.request'

export class UserSignUpRequest extends SignUpRequest {
  @ApiProperty()
  idToken: string;
}
export class UserSignInRequest extends SignInRequest {}