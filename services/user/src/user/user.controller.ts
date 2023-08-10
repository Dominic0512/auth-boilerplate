import { Controller, Get } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Get()
  list(): string {
    return 'user list';
  }
}
