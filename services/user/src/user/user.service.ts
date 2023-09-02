import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import {
  Between,
  DataSource,
  FindOptionsRelations,
  FindOptionsWhere,
  InsertResult,
  Repository,
} from 'typeorm';

import { UserRegisterByPasswordEvent } from '../common/event/user.event';
import { UserProviderEnum, UserStateEnum } from '../common/enum/user.enum';
import { User } from './entities/user.entity';
import { UserProvider } from './entities/user-provider.entity';
import {
  CreateUserWithPasswordDto,
  ProviderDto,
  UpdateUserDto,
  UpsertUserDto,
} from './user.dto';

@Injectable()
export class UserService {
  constructor(
    private dateSource: DataSource,
    private readonly configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserProvider)
    private userProviderRepository: Repository<UserProvider>,
    private eventEmitter: EventEmitter2,
  ) {}

  dummyPictureFactory(name: string): string {
    return `https://i0.wp.com/cdn.auth0.com/avatars/${name.slice(
      0,
      2,
    )}.png?ssl=1`;
  }

  transformProviderName(name: string): UserProviderEnum {
    const lowerName = name.toLowerCase();
    const capitalizeName =
      lowerName.charAt(0).toUpperCase() + lowerName.slice(1);
    return UserProviderEnum[capitalizeName];
  }

  find(
    where: FindOptionsWhere<User>,
    relations: FindOptionsRelations<User>,
  ): Promise<User[]> {
    return this.userRepository.find({ where, relations });
  }

  count(): Promise<number> {
    return this.userRepository.count();
  }

  countActiveUsersByTimeframe(startedAt: Date, endedAt: Date): Promise<number> {
    return this.userRepository.count({
      where: {
        lastSessionAt: Between<Date>(startedAt, endedAt),
      },
    });
  }

  async avgActiveUsersPerDateByTimeframe(
    startedAt: Date,
    endedAt: Date,
  ): Promise<number> {
    const { avg } = await this.dateSource
      .createQueryBuilder()
      .select('ROUND(AVG(uc.count), 1)', 'avg')
      .from((subQuery) => {
        return subQuery
          .select([
            'DATE_PART(\'year\', "lastSessionAt") AS "year"',
            'DATE_PART(\'month\', "lastSessionAt") AS "month"',
            'DATE_PART(\'day\', "lastSessionAt") AS "day"',
            'COUNT(user.name) AS "count"',
          ])
          .from(User, 'user')
          .where('"lastSessionAt" BETWEEN :startedAt AND :endedAt', {
            startedAt,
            endedAt,
          })
          .addGroupBy('year')
          .addGroupBy('month')
          .addGroupBy('day');
      }, 'uc')
      .getRawOne();
    return Number(avg);
  }

  async upsertWithProvider({
    providers,
    name,
    email,
  }: UpsertUserDto): Promise<User> {
    let user = await this.findOneByEmail(email);

    if (!user) {
      user = await this.userRepository.save({
        name,
        email,
        state: UserStateEnum.Verified,
      });
    }

    await this.upsertNewProvider(user.id, providers[0]);

    if (user.state === UserStateEnum.Pending) {
      return this.userRepository.save({
        ...user,
        state: UserStateEnum.Verified,
      });
    }

    return user;
  }

  upsertNewProvider(
    userId: number,
    provider: ProviderDto,
  ): Promise<InsertResult> {
    return this.userProviderRepository.upsert(
      {
        userId,
        ...provider,
      },
      ['userId', 'name'],
    );
  }

  async createWithPassword({
    name,
    verifyToken,
    ...rest
  }: CreateUserWithPasswordDto) {
    const user = await this.userRepository.save({
      ...rest,
      name,
      providers: [
        {
          name: UserProviderEnum.Primary,
          picture: this.dummyPictureFactory(name),
        },
      ],
    });

    this.eventEmitter.emit(
      UserRegisterByPasswordEvent.eventName,
      new UserRegisterByPasswordEvent({
        name,
        email: user.email,
        link: `${this.configService.get(
          'core.emailVerifyEndpoint',
        )}?token=${verifyToken}`,
      }),
    );

    return user;
  }

  findOneById(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }

  findProvidersByUserId(id: number): Promise<UserProvider[]> {
    return this.userProviderRepository.findBy({ userId: id });
  }

  async verifyByEmail(email: string): Promise<User> {
    const user = await this.findOneByEmail(email);
    user.state = UserStateEnum.Verified;
    return this.userRepository.save(user);
  }

  async updatePasswordById(id: number, password: string): Promise<User> {
    const user = await this.findOneById(id);

    return this.userRepository.save({
      ...user,
      password,
    });
  }

  async updateById(id: number, updateUserDto: Omit<UpdateUserDto, 'id'>) {
    const user = await this.findOneById(id);

    return this.userRepository.save({
      ...user,
      ...updateUserDto,
    });
  }
}
