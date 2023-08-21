import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(
    private readonly configService: ConfigService
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        const res = context.switchToHttp().getResponse<Response>();

        if (!data.hasOwnProperty('refreshToken')) return data;

        const { refreshToken, ...rest } = data;

        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: this.configService.get('core.nodeEnv') === 'production' ? true : false,
          maxAge: this.configService.get('core.refreshTokenAging') * 1000,
          sameSite: false,
        });

        return rest;
      }),
    );
  }
}
