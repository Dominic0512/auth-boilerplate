export enum RoleEnum {
  User = 'User',
  Admin = 'Admin'
}

export interface CurrentUser {
  id: number;
  role: RoleEnum;
}

export interface GenerateTokenOptions {
  aging?: number,
  secret?: string,
}

export interface EmailVerificationTokenPayload {
  email: string;
}

export interface AccessTokenPayload extends CurrentUser {}
export interface RefreshTokenPayload {
  id: number;
}