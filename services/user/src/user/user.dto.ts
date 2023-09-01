import {
  ArrayNotEmpty,
  IsBase64,
  IsEmail,
  IsEnum,
  IsJWT,
  IsNumber,
  IsUrl,
  MinLength,
} from "class-validator";

import { UserProviderEnum } from "../common/enum/user.enum";

export class ProviderDto {
  @IsEnum(UserProviderEnum)
  name: UserProviderEnum;

  @IsUrl()
  picture: string;
}

export class UpsertUserDto {
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @ArrayNotEmpty()
  providers: ProviderDto[];
}

export class CreateUserWithPasswordDto {
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  @IsBase64()
  password: string;

  @IsBase64()
  passwordSalt: string;

  @IsJWT()
  verifyToken: string;
}

export class ResetUserPasswordDto {
  @IsNumber()
  id: number;

  @IsBase64()
  newHashPassword: string;
}

export class ManipulateUserDto {
  @IsNumber()
  id: number;
}

export class UpdateUserDto extends ManipulateUserDto {
  @MinLength(1)
  name?: string;
}
