import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiResponse,
  ApiResponseSchemaHost,
  getSchemaPath,
} from '@nestjs/swagger';
import { ExceptionDto } from './exception.dto';

export function ApiExceptionDecorator<T>(
  statusCode: HttpStatus,
  message: string | T[],
  description?: string,
  options?: ApiResponseSchemaHost,
) {
  return applyDecorators(
    ApiResponse({
      ...options,
      status: statusCode,
      description: description,
      schema: {
        default: [
          {
            message: message,
            date: new Date().toISOString(),
          },
        ],
        type: getSchemaPath(ExceptionDto),
        ...options?.schema,
      },
    }),
  );
}
