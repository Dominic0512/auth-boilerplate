import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';

import { UserLoggedInEvent, UserTokenRefreshedEvent } from '../common/event/user.event';
import { UserActivity } from './entities/user-activity.entity';

@Injectable()
export class UserActivityService {
  private readonly logger = new Logger(UserActivityService.name);
  constructor(
    @InjectRepository(UserActivity) private userActivityRepository: Repository<UserActivity>,
  ) {}

  @OnEvent(UserLoggedInEvent.eventName, { async: true })
  async handleUserLoggedInEvent({ payload }: UserLoggedInEvent) {
    const { id: userId, ...meta } = payload;
    this.logger.verbose(`Receive ${UserLoggedInEvent.eventName} with user id: ${userId}.`);

    await this.userActivityRepository.save({
      event: UserLoggedInEvent.eventName,
      userId,
      meta,
    });
  }

  @OnEvent(UserTokenRefreshedEvent.eventName, { async: true })
  async handleUserTokenRefreshedEvent({ payload }: UserTokenRefreshedEvent) {
    const { id: userId, ...meta } = payload;
    this.logger.verbose(`Receive ${UserTokenRefreshedEvent.eventName} with user id: ${userId}.`);

    await this.userActivityRepository.save({
      event: UserTokenRefreshedEvent.eventName,
      userId,
      meta
    });
  }
}
