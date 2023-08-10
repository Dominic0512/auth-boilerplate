import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { AppModule } from './app.module';

const USER_HOST = process.env.USER_HOST || 'http://user:8000';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(['/api/user/swagger'], proxySwaggerResolverFactory(USER_HOST));
  app.use(['/api/user'], proxyResolverFactory(USER_HOST));
  await app.listen(8000);
}

bootstrap();

function proxyResolverFactory(target: string) {
  return createProxyMiddleware({
    target,
    secure: false,
    onProxyReq: (_, req) => {
      console.log(
        `[Global Functional Middlware]: Proxying ${req.method} request originally made to '${req.originalUrl}'...`,
      );
    },
  });
}

function proxySwaggerResolverFactory(target: string) {
  return createProxyMiddleware({
    target,
    pathRewrite: function (path) {
      const swaggerRootRegex = /^\/api\/.*\/(swagger$|swagger\/$)/;
      if (swaggerRootRegex.test(path)) return path.replace(swaggerRootRegex, '/api/swagger/');
      
      /*
       * NOTE: There duplicated resource namespace for resource files, so we need to handle especially.
       * ex: .../swagger/swagger/swagger-ui.css
       */
      return path.replace(/^\/api\/.*\/swagger\//, '/api/swagger/swagger/');
    },
    secure: false,
    onProxyReq: (_, req) => {
      console.log(
        `[swagger-resolver][Global Functional Middlware]: Proxying ${req.method} request originally made to '${req.originalUrl}'...`,
      );
    },
  });
}

