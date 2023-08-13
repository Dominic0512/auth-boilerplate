import { ApiProperty } from "@nestjs/swagger";

export class TokenResponse {
  @ApiProperty({ default: '{JSON Web Token}'})
  token: string;
}