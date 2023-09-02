import { LiteralObject } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ExceptionDto {
  @ApiProperty()
  message: string | LiteralObject[];

  @ApiProperty({ default: new Date().toISOString() })
  date: Date;
}
