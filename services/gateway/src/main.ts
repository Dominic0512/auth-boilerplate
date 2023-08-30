import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';

import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { ClassValidatorPipe } from './common/pipe/class-validator.pipe';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', { exclude: [''] });

  const config = new DocumentBuilder()
    .setTitle('User service document')
    .setDescription('The user API description')
    .setVersion('1.0')
    .addBearerAuth({
      description: `Please enter token in following format: Bearer <JWT>`,
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    })
    .addTag('user')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ClassValidatorPipe());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
    }),
  );

  await app.listen(8000);
}

bootstrap();
