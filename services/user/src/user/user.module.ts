import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "./entities/user.entity";
import { UserProvider } from "./entities/user-provider.entity";
import { UserActivity } from "./entities/user-activity.entity";
import { UserActivityService } from "./user-activity.service";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProvider, UserActivity])],
  controllers: [UserController],
  providers: [UserService, UserActivityService],
})
export class UserModule {}
