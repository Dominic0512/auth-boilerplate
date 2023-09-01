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
export class RefreshTokenInterceptor implements NestInterceptor {
  private refreshTokenOptions: CookieOptions;

  constructor(private readonly configService: ConfigService) {
    this.refreshTokenOptions = {
      httpOnly: true,
      secure:
        this.configService.get('core.nodeEnv') === 'production' ? true : false,
      maxAge: this.configService.get('core.refreshTokenAging') * 1000,
      sameSite: false,
    };
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const req = context.switchToHttp().getRequest<Request>();
        const res = context.switchToHttp().getResponse<Response>();

        if (['/api/logout', '/api/reset-password'].includes(req.url)) {
          res.clearCookie('refreshToken', this.refreshTokenOptions).status(204);
          return data;
        }

        // NOTE: Only keep refresh token in cookies.
        if (!data || !data.refreshToken) return data;

        res.cookie('refreshToken', data.refreshToken, this.refreshTokenOptions);

        return data;
      }),
    );
  }
}
