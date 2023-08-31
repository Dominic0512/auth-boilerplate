import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

import { ClassValidatorPipe } from './common/pipe/class-validator.pipe';
import { AppModule } from './app.module';
import { configuration } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: configuration().core.host,
        port: configuration().core.port,
      },
    },
  );
  app.useGlobalPipes(new ClassValidatorPipe());
  await app.listen();
}
bootstrap();
