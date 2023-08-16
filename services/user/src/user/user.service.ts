import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';

import { User, UserStateEnum } from './entities/user.entity';
import { ProviderEnum, UserProvider } from './entities/user-provider.entity';
import { CreateUserWithPasswordDto, ProviderDto, UpsertUserDto } from './user.dto';
import { UserRegisterByPasswordEvent } from 'src/common/event/user.event';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserProvider) private userProviderRepository: Repository<UserProvider>,
    private eventEmitter: EventEmitter2
  ) {}

  dummyPictureFactory(name: string) {
    return `https://i0.wp.com/cdn.auth0.com/avatars/${name.slice(0,2)}.png?ssl=1`;
  }

  passwordSaltFactory() {
    return crypto.randomBytes(16).toString('base64');
  }

  hashPasswordFactory(password: string, salt: string) {
    return crypto.createHmac('sha256', salt).update(password).digest('base64');
  }

  transformProvider(name: string) {
    const lowerName = name.toLowerCase();
    const capitalizeName = lowerName.charAt(0).toUpperCase() + lowerName.slice(1);
    return ProviderEnum[capitalizeName];
  }

  async upsertWithProvider({ providers, name, email }: UpsertUserDto) {
    let user = await this.findOneByEmail(email);

    if (!user.id) {
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

  async createWithPassword({ name, password, token, ...rest }: CreateUserWithPasswordDto) {
    const passwordSalt = this.passwordSaltFactory();

    const user = await this.userRepository.save({
      ...rest,
      name,
      password: this.hashPasswordFactory(password, passwordSalt),
      passwordSalt,
      providers: [{
        name: ProviderEnum.Primary,
        picture: this.dummyPictureFactory(name),
      }]
    });

    this.eventEmitter.emit(
      UserRegisterByPasswordEvent.eventName,
      new UserRegisterByPasswordEvent({
        name: name,
        email: user.email,
        link: `http://localhost:10001/api/user/verify?token=${token}`
      }),
    );

    return user;
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async verifyByEmail(email: string) {
    const user = await this.findOneByEmail(email);
    user.state = UserStateEnum.Verified;
    return this.userRepository.save(user);
  }
}
