import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { UserService } from './user.service';
import { CreateUserWithPasswordDto, ResetUserPasswordDto, UpsertUserDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService
  ) {}
  @Get()
  list(): string {
    return 'user list';
  }

  @MessagePattern('USER_GET_BY_ID')
  async getById(@Payload() { id }) {
    return await this.userService.findOneById(id);
  }

  @MessagePattern('USER_GET_BY_EMAIL')
  async getByEmail(@Payload() { email }) {
    return await this.userService.findOneByEmail(email);
  }

  @MessagePattern('USER_CREATE_WITH_PASSWORD')
  async createWithPassword(@Payload() createUserWithPassword: CreateUserWithPasswordDto) {
    return await this.userService.createWithPassword(createUserWithPassword);
  }

  @MessagePattern('USER_VERIFY_BY_EMAIL')
  async verifyByEmail(@Payload() { email }: { email: string }) {
    return await this.userService.verifyByEmail(email);
  }

  @MessagePattern('USER_UPSERT_WITH_PROVIDER')
  async upsertWithProvider(@Payload() upsertUserDto: UpsertUserDto) {
    const { providers } = upsertUserDto;
    return await this.userService.upsertWithProvider({
      ...upsertUserDto,
      providers: providers.map(({ name, picture }) => ({
        name: this.userService.transformProviderName(name),
        picture,
      }))
    });
  }

  @MessagePattern('USER_RESET_PASSWORD')
  async updatePassword(@Payload() { id, newHashPassword }: ResetUserPasswordDto) {
    return await this.userService.updatePasswordById(id, newHashPassword);
  }
}
