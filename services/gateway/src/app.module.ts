import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { configuration } from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/auth.guard';
import { AppController } from './app.controller';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { JWTMiddleware } from './auth/middleware';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
  ],
  controllers: [AppController, AuthController, UserController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: 'USER_SERVICE',
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('core.user.host'),
            port: configService.get('core.user.port'),
          },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JWTMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
