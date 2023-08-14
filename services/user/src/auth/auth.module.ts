import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsValidAuth0TokenConstraint } from './auth.validator';

@Module({
  providers: [AuthService, IsValidAuth0TokenConstraint],
  exports: [AuthService]
})
export class AuthModule {}
