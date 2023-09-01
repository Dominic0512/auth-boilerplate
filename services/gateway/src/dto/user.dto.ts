import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { MinLength, IsNumber } from "class-validator";

import { BaseDto } from "../common/dto/base.dto";

export class UserDto extends BaseDto<UserDto> {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  state: string;

  @ApiProperty()
  @Expose()
  role: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @Exclude({ toPlainOnly: true })
  password?: string;

  @Exclude({ toPlainOnly: true })
  passwordSalt?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

export class InternalUserDto extends UserDto {
  @ApiProperty()
  @Expose()
  lastSessionAt: Date;

  @ApiProperty()
  @Expose()
  loggedInCount: number;
}

export class ManipulateUserDto {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  id: number;
}

export class UpdateInternalUserDto {
  @ApiProperty()
  @MinLength(1)
  name: string;
}

export class PartialUpdateInternalUserDto {
  @ApiProperty({ nullable: true })
  @MinLength(1)
  name?: string;
}

export class UpdateMyNameDto {
  @ApiProperty()
  @MinLength(1)
  name: string;
}

export class UserStatisticsDto extends BaseDto<UserStatisticsDto> {
  @ApiProperty()
  @Expose()
  countOfRegisterUsers: number;

  @ApiProperty()
  @Expose()
  countOfActiveUsersByToday: number;

  @ApiProperty()
  @Expose()
  averageOfActiveUsersInSevenDays: number;
}
