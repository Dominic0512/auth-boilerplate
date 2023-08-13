import { ApiProperty } from '@nestjs/swagger';

export class ExceptionDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ default: new Date().toISOString() })
  date: Date;
}