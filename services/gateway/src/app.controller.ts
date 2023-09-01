import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/__health')
  __health(): boolean {
    return true;
  }
}
