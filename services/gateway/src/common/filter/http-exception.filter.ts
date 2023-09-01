import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const httpStatus = exception.getStatus();

    // NOTE: use array key to get class validator pipe messages to bypass private attribule restriction.
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const message = exception["response"].message;

    response.status(httpStatus).json({
      message,
      date: new Date().toISOString(),
    });
  }
}
