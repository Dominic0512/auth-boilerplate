import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./auth.type";

export type RequestWithCurrentUser = Request & { currentUser: CurrentUser};

@Injectable()
export class JWTMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}
  async use(req: Request, _response: Response, next: NextFunction) {
    const token = parseBearerToken(req);
    console.log(token);
    if (token && this.authService.verifyPrimaryAuthToken(token).success) {
      const currentUser: CurrentUser = this.authService.decodeToken(token);

      req['currentUser'] = currentUser;
    } else {
      req['currentUser'] = null;
    }

    next();
  }
}

function parseBearerToken(req: Request): string | null {
  const auth = req.headers ? req.headers.authorization || null : null;
  if (!auth) {
    return null;
  }

  const parts = auth.split(' ');

  if (parts.length < 2) {
    return null;
  }

  const schema = (parts.shift() as string).toLowerCase();

  if (schema !== 'bearer') {
    return null;
  }

  return parts.shift();
}
