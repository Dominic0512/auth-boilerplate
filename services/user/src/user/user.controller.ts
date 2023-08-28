import { Controller, Get } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CreateUserWithPasswordDto, ResetUserPasswordDto, UpsertUserDto } from './user.dto';
import { UserProviderEnum } from '../common/enum/user.enum';
import { UserLoggedInEvent, UserTokenRefreshedEvent } from '../common/event/user.event';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private eventEmitter: EventEmitter2
  ) {}

  @MessagePattern('USER_LIST')
  async list(){
    return await this.userService.find();
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

  @EventPattern('USER_LOGGED_IN')
  handleUserLoggedIn(@Payload() { id, provider = UserProviderEnum.Primary }) {
    this.eventEmitter.emit(
      UserLoggedInEvent.eventName,
      new UserLoggedInEvent({
        id,
        provider: this.userService.transformProviderName(provider)
      }),
    );
  }

  @EventPattern('USER_TOKEN_REFRESHED')
  handleUserTokenRefreshed(@Payload() { id }) {
    this.eventEmitter.emit(
      UserTokenRefreshedEvent.eventName,
      new UserTokenRefreshedEvent({ id }),
    );
  }
}
