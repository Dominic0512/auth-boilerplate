import { ApiProperty } from "@nestjs/swagger";

export class ManipulateUserDto {
  @ApiProperty()
  id: number;
}