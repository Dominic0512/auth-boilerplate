import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as moment from 'moment';
import 'moment-timezone';

import {
  CreateUserWithPasswordDto,
  ResetUserPasswordDto,
  UpdateUserDto,
  UpsertUserDto,
} from './user.dto';
import { UserProviderEnum } from '../common/enum/user.enum';
import {
  UserLoggedInEvent,
  UserTokenRefreshedEvent,
} from '../common/event/user.event';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private eventEmitter: EventEmitter2,
  ) {}

  @MessagePattern('USER_LIST')
  list() {
    return this.userService.find();
  }

  @MessagePattern('USER_GET_BY_ID')
  getById(@Payload() { id }): Promise<User> {
    return this.userService.findOneById(id);
  }

  @MessagePattern('USER_GET_BY_EMAIL')
  getByEmail(@Payload() { email }): Promise<User> {
    return this.userService.findOneByEmail(email);
  }

  @MessagePattern('USER_STATISTICS')
  async getStatistics() {
    const endOfToday = moment()
      .tz('Asia/Taipei')
      .set('hour', 23)
      .set('minute', 59)
      .set('second', 59)
      .tz('UTC')
      .toDate();
    const endOfOneDayAgo = moment(endOfToday).subtract(1, 'days').toDate();
    const endOfSevenDaysAgo = moment(endOfToday).subtract(7, 'days').toDate();

    const result = await Promise.all([
      this.userService.count(),
      this.userService.countActiveUsersByTimeframe(endOfOneDayAgo, endOfToday),
      this.userService.avgActiveUsersPerDateByTimeframe(
        endOfSevenDaysAgo,
        endOfToday,
      ),
    ]);

    return {
      countOfRegisterUsers: result[0],
      countOfActiveUsersByToday: result[1],
      averageOfActiveUsersInSevenDays: result[2],
    };
  }

  @MessagePattern('USER_CREATE_WITH_PASSWORD')
  createWithPassword(
    @Payload() createUserWithPassword: CreateUserWithPasswordDto,
  ) {
    return this.userService.createWithPassword(createUserWithPassword);
  }

  @MessagePattern('USER_VERIFY_BY_EMAIL')
  verifyByEmail(@Payload() { email }: { email: string }) {
    return this.userService.verifyByEmail(email);
  }

  @MessagePattern('USER_UPSERT_WITH_PROVIDER')
  upsertWithProvider(@Payload() upsertUserDto: UpsertUserDto) {
    const { providers } = upsertUserDto;
    return this.userService.upsertWithProvider({
      ...upsertUserDto,
      providers: providers.map(({ name, picture }) => ({
        name: this.userService.transformProviderName(name),
        picture,
      })),
    });
  }

  @MessagePattern('USER_RESET_PASSWORD')
  updatePassword(@Payload() { id, newHashPassword }: ResetUserPasswordDto) {
    return this.userService.updatePasswordById(id, newHashPassword);
  }

  @MessagePattern('USER_UPDATE_BY_ID')
  update(@Payload() { id, ...rest }: UpdateUserDto) {
    return this.userService.updateById(id, rest);
  }

  @EventPattern('USER_LOGGED_IN')
  handleUserLoggedIn(@Payload() { id, provider = UserProviderEnum.Primary }) {
    this.eventEmitter.emit(
      UserLoggedInEvent.eventName,
      new UserLoggedInEvent({
        id,
        provider: this.userService.transformProviderName(provider),
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
