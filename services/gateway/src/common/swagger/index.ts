import { HttpStatus, LiteralObject } from '@nestjs/common';
import { ApiResponseSchemaHost } from '@nestjs/swagger';
import { ApiExceptionDecorator } from './exception.decorator';

export enum HttpMessage {
  BadRequest = 'Bad Request',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  InternalServerError = 'Internal Server Error',
}

export interface ApiExceptionParams {
  message?: string | LiteralObject[];
  description?: string;
  options?: ApiResponseSchemaHost;
}

export function ApiBadRequestException({
  message = HttpMessage.BadRequest,
  description = HttpMessage.BadRequest,
  options,
}: ApiExceptionParams = {}) {
  options = {
    ...options,
    schema: {
      ...options?.schema,
      default: [
        {
          message: HttpMessage.BadRequest,
          date: new Date().toISOString(),
        },
        {
          message: [
            { property: 'property1', message: 'The property1 is invalid.' },
          ],
          date: new Date().toISOString(),
        },
      ],
    },
  };
  return ApiExceptionDecorator(
    HttpStatus.BAD_REQUEST,
    message,
    description,
    options,
  );
}

export function ApiUnauthorizedException({
  message = HttpMessage.Unauthorized,
  description = HttpMessage.Unauthorized,
  options,
}: ApiExceptionParams = {}) {
  return ApiExceptionDecorator(
    HttpStatus.UNAUTHORIZED,
    message,
    description,
    options,
  );
}

export function ApiForbiddenException({
  message = HttpMessage.Forbidden,
  description = HttpMessage.Forbidden,
  options,
}: ApiExceptionParams = {}) {
  return ApiExceptionDecorator(
    HttpStatus.FORBIDDEN,
    message,
    description,
    options,
  );
}

export function ApiInternalServerErrorException({
  message = HttpMessage.InternalServerError,
  description = HttpMessage.InternalServerError,
  options,
}: ApiExceptionParams = {}) {
  return ApiExceptionDecorator(
    HttpStatus.INTERNAL_SERVER_ERROR,
    message,
    description,
    options,
  );
}
