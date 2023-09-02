import { ValidationError } from 'class-validator';

export class CommonException extends Error {}

export class ValidationException extends CommonException {
  private errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Invalid Inputs');
    this.errors = errors;
  }

  private formatedNestedErrors(errors: ValidationError[], path: string[] = []) {
    return errors.reduce((result, error) => {
      if (error.children.length > 0) {
        return [
          ...result,
          ...this.formatedNestedErrors(error.children, [
            ...path,
            error.property,
          ]),
        ];
      }

      return [
        ...result,
        {
          field: [...path, error.property].join('.'),
          message: `${Object.values(error.constraints).join(' ')}`,
        },
      ];
    }, []);
  }

  public formatedErrors() {
    return this.formatedNestedErrors(this.errors);
  }
}
