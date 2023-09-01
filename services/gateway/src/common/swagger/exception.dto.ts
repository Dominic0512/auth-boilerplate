import { ApiProperty } from "@nestjs/swagger";
import { ClassValidatorError } from "../pipe/class-validator.pipe";

export class ExceptionDto {
  @ApiProperty()
  message: string | ClassValidatorError[];

  @ApiProperty({ default: new Date().toISOString() })
  date: Date;
}
