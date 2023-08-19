export enum RoleEnum {
  User = 'User',
  Admin = 'Admin'
}

export type CurrentUser = {
  id: number;
  email: string;
  role: RoleEnum;
}
