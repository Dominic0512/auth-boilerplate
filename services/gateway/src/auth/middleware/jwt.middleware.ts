import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { CurrentUser } from '../auth.type';

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

export interface RequestWithCurrentUser extends Request {
  currentUser: CurrentUser;
  isTokenExpired: boolean;
}

@Injectable()
export class JWTMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(
    req: RequestWithCurrentUser,
    _response: Response,
    next: NextFunction,
  ) {
    const token = parseBearerToken(req);
    req.currentUser = null;

    if (token && this.authService.verifyPrimaryAccessToken(token).success) {
      const currentUser: CurrentUser = this.authService.decodeToken(token);
      req.currentUser = currentUser;
    }

    if (token) {
      req.isTokenExpired = this.authService.isPrimaryTokenExpired(token);
    }

    next();
  }
}
