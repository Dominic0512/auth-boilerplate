import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // NOTE: use array key to get class validator pipe messages to bypass private attribule restriction.
    const message = exception["response"]["message"];

    response
      .status(status)
      .json({
        message,
        date: new Date().toISOString(),
      });
  }
}