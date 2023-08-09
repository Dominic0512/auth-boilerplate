import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://user:10002',
      secure: false,
      onProxyReq: (_, req) => {
        console.log(
          `[Global Functional Middlware]: Proxying ${req.method} request originally made to '${req.originalUrl}'...`,
        );
      },
    }),
  );
  await app.listen(10001);
}
bootstrap();
