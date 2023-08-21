import { ArrayNotEmpty, IsBase64, IsEmail, IsEnum, IsHash, IsJWT, IsStrongPassword, IsUrl, MinLength } from 'class-validator';

import { ProviderEnum } from './entities/user-provider.entity';

export const passwordRules = {
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
  minLength: 8,
}

export class ProviderDto {
  @IsEnum(ProviderEnum)
  name: ProviderEnum;

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

  @IsHash('sha256')
  password: string;

  @IsBase64()
  passwordSalt: string;

  @IsJWT()
  verifyToken: string;
}

export class ResetUserPasswordDto {
  id: number;

  oldHashPassword: string;

  newHashPassword: string;
}

