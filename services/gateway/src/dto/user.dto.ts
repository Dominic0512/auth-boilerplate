import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { BaseDto } from 'src/common/dto/base.dto';

export class ManipulateUserDto {
  @ApiProperty()
  id: number;
}
export class UpdateMyNameDto {
  @ApiProperty()
  name: string;
}

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
