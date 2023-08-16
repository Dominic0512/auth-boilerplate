import { ArrayNotEmpty, IsEmail, IsEnum, IsJWT, IsStrongPassword, IsUrl, MinLength } from 'class-validator';

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

  @IsStrongPassword(passwordRules)
  password: string;

  @IsJWT()
  token: string;
}

