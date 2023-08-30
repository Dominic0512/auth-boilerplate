import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TokenResponse {
  constructor(partial: Partial<TokenResponse>) {
    Object.assign(this, partial);
  }

  @ApiProperty({ default: '{ JSON Web Token }' })
  @Expose()
  accessToken: string;

  // NOTE: Will be removed by auth interceptor.
  refreshToken: string;
}
