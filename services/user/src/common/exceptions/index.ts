import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';
import { ApiExceptionDecorator } from './exception.decorator';

export enum HttpMessage {
  BadRequest = 'Bad Request',
  InternalServerError = 'Internal Server Error'
}

export interface ApiExceptionParams {
  message?: string,
  description?: string,
  options?: ApiResponseOptions
}

export function ApiBadRequestException({
  message = HttpMessage.BadRequest,
  description = HttpMessage.BadRequest,
  options
}: ApiExceptionParams = {}) {
  return ApiExceptionDecorator(
    HttpStatus.BAD_REQUEST,
    message,
    description,
    options,
  );
}

export function InternalServerErrorException({
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
