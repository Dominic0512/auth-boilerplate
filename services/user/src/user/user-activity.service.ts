import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository, InjectEntityManager } from "@nestjs/typeorm";
import { OnEvent } from "@nestjs/event-emitter";
import { EntityManager, Repository } from "typeorm";

import {
  UserLoggedInEvent,
  UserTokenRefreshedEvent,
} from "../common/event/user.event";
import { User } from "./entities/user.entity";
import { UserActivity } from "./entities/user-activity.entity";

@Injectable()
export class UserActivityService {
  private readonly logger = new Logger(UserActivityService.name);

  constructor(
    @InjectEntityManager() private entityManger: EntityManager,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserActivity)
    private userActivityRepository: Repository<UserActivity>
  ) {}

  @OnEvent(UserLoggedInEvent.eventName, { async: true })
  async handleUserLoggedInEvent({ payload }: UserLoggedInEvent) {
    const { id: userId, ...meta } = payload;
    this.logger.verbose(
      `Receive ${UserLoggedInEvent.eventName} with user id: ${userId}.`
    );

    try {
      await this.entityManger.transaction(
        async (txEntityManger: EntityManager) => {
          const { createdAt } = await txEntityManger
            .getRepository(UserActivity)
            .save({
              event: UserLoggedInEvent.eventName,
              userId,
              meta,
            });

          await txEntityManger
            .createQueryBuilder()
            .update(User)
            .where({ id: userId })
            .set({
              loggedInCount: () => "loggedInCount + 1",
              lastSessionAt: createdAt,
            })
            .execute();
        }
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  @OnEvent(UserTokenRefreshedEvent.eventName, { async: true })
  async handleUserTokenRefreshedEvent({ payload }: UserTokenRefreshedEvent) {
    const { id: userId, ...meta } = payload;
    this.logger.verbose(
      `Receive ${UserTokenRefreshedEvent.eventName} with user id: ${userId}.`
    );

    try {
      await this.entityManger.transaction(
        async (txEntityManger: EntityManager) => {
          const { createdAt } = await txEntityManger
            .getRepository(UserActivity)
            .save({
              event: UserTokenRefreshedEvent.eventName,
              userId,
              meta,
            });

          await txEntityManger.getRepository(User).save({
            id: userId,
            lastSessionAt: createdAt,
          });
        }
      );
    } catch (e) {
      this.logger.error(e);
    }
  }
}
