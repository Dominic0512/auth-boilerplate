import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserProvider } from './entities/user-provider.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([User, UserProvider])
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
