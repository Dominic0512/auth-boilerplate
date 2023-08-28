import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

import { UserRegisterByPasswordEvent } from '../common/event/user.event';
import { UserProviderEnum, UserStateEnum } from '../common/enum/user.enum';
import { User } from './entities/user.entity';
import { UserProvider } from './entities/user-provider.entity';
import { CreateUserWithPasswordDto, ProviderDto, UpsertUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserProvider) private userProviderRepository: Repository<UserProvider>,
    private eventEmitter: EventEmitter2
  ) {}

  dummyPictureFactory(name: string) {
    return `https://i0.wp.com/cdn.auth0.com/avatars/${name.slice(0,2)}.png?ssl=1`;
  }

  transformProviderName(name: string) {
    const lowerName = name.toLowerCase();
    const capitalizeName = lowerName.charAt(0).toUpperCase() + lowerName.slice(1);
    return UserProviderEnum[capitalizeName];
  }

  async find() {
    return await this.userRepository
      .createQueryBuilder('user')
      .getMany();
  }

  async upsertWithProvider({ providers, name, email }: UpsertUserDto) {
    let user = await this.findOneByEmail(email);

    if (!user) {
      user = await this.userRepository.save({
        name,
        email,
        state: UserStateEnum.Verified
      });
    }

    await this.upsertNewProvider(user.id, providers[0]);

    if (user.state === UserStateEnum.Pending) {
      return this.userRepository.save({
        ...user,
        state: UserStateEnum.Verified
      });
    }

    return user;
  }

  async upsertNewProvider(userId: number, provider: ProviderDto) {
    return await this.userProviderRepository.upsert({
      userId,
      ...provider,
    }, ['userId', 'name']);
  }

  async createWithPassword({ name, verifyToken, ...rest }: CreateUserWithPasswordDto) {
    const user = await this.userRepository.save({
      ...rest,
      name,
      providers: [{
        name: UserProviderEnum.Primary,
        picture: this.dummyPictureFactory(name),
      }]
    });

    this.eventEmitter.emit(
      UserRegisterByPasswordEvent.eventName,
      new UserRegisterByPasswordEvent({
        name: name,
        email: user.email,
        link: `${this.configService.get('core.emailVerifyEndpoint')}?token=${verifyToken}`
      }),
    );

    return user;
  }

  async findOneById(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async verifyByEmail(email: string) {
    const user = await this.findOneByEmail(email);
    user.state = UserStateEnum.Verified;
    return this.userRepository.save(user);
  }

  async updatePasswordById(id: number, password: string) {
    const user = await this.findOneById(id);

    return this.userRepository.save(
      {
        ...user,
        password,
      },
    );
  }
}
