import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieOptions, Request, Response } from 'express';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  private refreshTokenOptions: CookieOptions

  constructor(
    private readonly configService: ConfigService
  ) {
    this.refreshTokenOptions = {
      httpOnly: true,
      secure: this.configService.get('core.nodeEnv') === 'production' ? true : false,
      maxAge: this.configService.get('core.refreshTokenAging') * 1000,
      sameSite: false,
    };
  }
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const req = context.switchToHttp().getRequest<Request>();
        const res = context.switchToHttp().getResponse<Response>();

        if (req.url === '/api/logout') {
          res.clearCookie('refreshToken', this.refreshTokenOptions);
          return data;
        }

        if (!data.hasOwnProperty('refreshToken')) return data;

        const { refreshToken, ...rest } = data;

        res.cookie('refreshToken', refreshToken, this.refreshTokenOptions);

        return rest;
      }),
    );
  }
}
