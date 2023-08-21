import { ApiProperty } from "@nestjs/swagger";

export class TokenResponse {
  @ApiProperty({ default: '{ JSON Web Token }'})
  accessToken: string;

  // NOTE: Will be removed by auth interceptor.
  refreshToken: string;
}