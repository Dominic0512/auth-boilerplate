import { HttpStatus } from '@nestjs/common';
import { ApiResponseSchemaHost } from '@nestjs/swagger';
import { ApiExceptionDecorator } from './exception.decorator';
import { ClassValidatorError } from '../pipes/class-validator.pipe';

export enum HttpMessage {
  BadRequest = 'Bad Request',
  InternalServerError = 'Internal Server Error',
  Unauthorized = 'Unauthorized',
}

export interface ApiExceptionParams {
  message?: string | ClassValidatorError[],
  description?: string,
  options?: ApiResponseSchemaHost
}

export function ApiBadRequestException({
  message = HttpMessage.BadRequest,
  description = HttpMessage.BadRequest,
  options
}: ApiExceptionParams = {}) {
  options = {
    ...options,
    schema: {
      ...options?.schema,
      default: [{
        message: 'Bad request',
        date: new Date().toISOString(),
      },
      {
        message: [{ property: 'property1', message: 'The property1 is invalid.'}],
        date: new Date().toISOString(),
      }]
    }
  };
  return ApiExceptionDecorator<ClassValidatorError>(
    HttpStatus.BAD_REQUEST,
    message,
    description,
    options
  );
}

export function ApiUnauthorizedException({
  message = HttpMessage.Unauthorized,
  description = HttpMessage.Unauthorized,
  options
}: ApiExceptionParams = {}) {
  return ApiExceptionDecorator(
    HttpStatus.UNAUTHORIZED,
    message,
    description,
    options,
  );
}

export function ApiInternalServerErrorException({
  message = HttpMessage.InternalServerError,
  description = HttpMessage.InternalServerError,
  options
}: ApiExceptionParams = {}) {
  return ApiExceptionDecorator(
    HttpStatus.INTERNAL_SERVER_ERROR,
    message,
    description,
    options,
  );
}
