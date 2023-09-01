import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleEnum, CurrentUser } from "./auth.type";

const matchRoles = (roles: RoleEnum[], userRole: RoleEnum) => {
  return roles.some((role) => role === userRole);
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<RoleEnum[]>("roles", context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const currentUser: CurrentUser = request.currentUser;

    if (!currentUser) {
      throw new UnauthorizedException("Invalid token.");
    }

    return matchRoles(roles, currentUser.role);
  }
}
