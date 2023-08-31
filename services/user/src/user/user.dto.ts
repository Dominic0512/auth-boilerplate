import {
  ArrayNotEmpty,
  IsBase64,
  IsEmail,
  IsEnum,
  IsJWT,
  IsNumber,
  IsUrl,
  MinLength,
} from 'class-validator';

import { UserProviderEnum } from '../common/enum/user.enum';

export const passwordRules = {
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
  minLength: 8,
};

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
  @IsEmail()
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
  oldHashPassword: string;

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
