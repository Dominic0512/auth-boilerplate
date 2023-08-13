import { ApiProperty } from "@nestjs/swagger";

export class SignUpRequest {
  @ApiProperty()
  idToken: string;
}
export class SignInRequest extends SignUpRequest {}