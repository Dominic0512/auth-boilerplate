export class ProviderDto {
  name: string;
  picture: string;
}

export class CreateUserDto {
  name: string;
  email: string;
  providers: ProviderDto[];
}

export class CreateUserWithPasswordDto {
  name: string;
  email: string;
  password: string;
}

