import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

export class ManipulateUserDto {
  @ApiProperty()
  id: number;
}

export class UserDto {
  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  state: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  password?: string;

  @ApiProperty()
  @Exclude({ toPlainOnly: true })
  passwordSalt?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  lastSessionAt: Date;

  @ApiProperty()
  loggedInCount: number;
}