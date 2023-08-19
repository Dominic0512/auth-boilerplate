import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { ClassValidatorPipe } from './common/pipe/class-validator.pipe'
import configuration from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: configuration().core.host,
        port: configuration().core.port,
      }
    }
  );
  await app.listen();

  app.useGlobalPipes(new ClassValidatorPipe());
}
bootstrap();
