import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as moment from 'moment';
import 'moment-timezone';

import { CreateUserWithPasswordDto, ResetUserPasswordDto, UpsertUserDto } from './user.dto';
import { UserProviderEnum } from '../common/enum/user.enum';
import { UserLoggedInEvent, UserTokenRefreshedEvent } from '../common/event/user.event';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

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
  async getById(@Payload() { id }): Promise<User> {
    const user = await this.userService.findOneById(id);
    console.log('USER CONTROLLOER', user.constructor.name);
    return user;
  }

  @MessagePattern('USER_GET_BY_EMAIL')
  async getByEmail(@Payload() { email }): Promise<User> {
    return await this.userService.findOneByEmail(email);
  }

  @MessagePattern('USER_STATISTICS')
  async getStatistics() {
    const endOfToday = moment().tz('Asia/Taipei').set('hour', 23).set('minute', 59).set('second', 59).tz('UTC').toDate();
    const endOfOneDayAgo = moment(endOfToday).subtract(1, 'days').toDate();
    const endOfSevenDaysAgo = moment(endOfToday).subtract(7, 'days').toDate();

    const result = await Promise.all([
      this.userService.count(),
      this.userService.countActiveUsersByTimeframe(endOfOneDayAgo, endOfToday),
      this.userService.avgActiveUsersPerDateByTimeframe(endOfSevenDaysAgo, endOfToday)
    ]);

    return {
      countOfRegisterUsers: result[0],
      countOfActiveUsersByToday: result[1],
      averageOfActiveUsersInSevenDays: result[2]
    };
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
