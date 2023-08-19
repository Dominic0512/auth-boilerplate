import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@ValidatorConstraint({ name: 'IsValidAuth0Token' })
@Injectable()
export class IsValidAuth0TokenConstraint implements ValidatorConstraintInterface {
  constructor(private authService: AuthService) {}

  validate(token: string) {
    const result = this.authService.verifyAuth0Token(token);
    return result.success;
  }

  defaultMessage(args: ValidationArguments) {
    const result = this.authService.verifyAuth0Token(args.value);
    return result.message || '';
  }
}

export function IsValidAuth0Token(validationOptions?: ValidationOptions) {
  return function(object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidAuth0TokenConstraint,
    });
  };
}
