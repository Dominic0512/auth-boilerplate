import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('/__health')
  __health(): boolean {
    return true;
  }
}
