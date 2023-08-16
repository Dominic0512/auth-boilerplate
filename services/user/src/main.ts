import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { ClassValidatorPipe } from './common/pipe/class-validator.pipe'


import { Catch, ArgumentsHost, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', { exclude: [''] });

  const config = new DocumentBuilder()
    .setTitle('User service document')
    .setDescription('The user API description')
    .setVersion('1.0')
    .addTag('user')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ClassValidatorPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(8000);
}
bootstrap();
