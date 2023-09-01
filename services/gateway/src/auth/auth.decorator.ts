import { SetMetadata, applyDecorators } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { RoleEnum } from "./auth.type";

export const Roles = (...roles: RoleEnum[]) => SetMetadata("roles", roles);

export function ApiBearAuthWithRoles(roles: RoleEnum[], tokenName?: string) {
  return applyDecorators(
    Roles(...roles),
    tokenName ? ApiBearerAuth(tokenName) : ApiBearerAuth()
  );
}
