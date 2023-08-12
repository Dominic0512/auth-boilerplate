export class ProviderDto {
  name: string;
  picture: string;
}

export class CreateUserDto {
  name: string;
  email: string;
  providers: ProviderDto[];
}