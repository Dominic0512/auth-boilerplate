import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DataSource, DataSourceOptions } from 'typeorm';
import { createDatabase } from 'typeorm-extension';

import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JWTMiddleware } from './auth/auth.middleware';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/auth.guard';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'cockroachdb',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        database: configService.get<string>('database.name'),
        username: configService.get<string>('database.username'),
        ssl: false,
        synchronize: true,
        autoLoadEntities: true,
      }),
      dataSourceFactory: async (options: DataSourceOptions) => {
        await createDatabase({ options });
        return await new DataSource(options).initialize();
      },
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UserModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
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
