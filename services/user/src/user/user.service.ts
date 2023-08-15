import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { ProviderEnum, UserProvider } from './entities/user-provider.entity';
import { CreateUserDto, CreateUserWithPasswordDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
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
    const capitalizeName = lowerName.charAt(0).toUpperCase + lowerName.slice(1);
    return ProviderEnum[capitalizeName];
  }

  async create({ providers, name, ...rest }: CreateUserDto) {
    const userProviders = providers.map((provider) => {
      const userProvider = new UserProvider();
      userProvider.name = provider.name;
      userProvider.picture = provider.picture ?? this.dummyPictureFactory(name);
      return userProvider;
    });

    return this.userRepository.save({
      ...rest,
      name,
      providers: userProviders
    });
  }

  async createWithPassword({ name, password, ...rest }: CreateUserWithPasswordDto) {
    const passwordSalt = this.passwordSaltFactory();

    return this.userRepository.save({
      ...rest,
      name,
      password: this.hashPasswordFactory(password, passwordSalt),
      passwordSalt,
      providers: [{
        name: ProviderEnum.Primary,
        picture: this.dummyPictureFactory(name),
      }]
    });
  }

  async findOneByEmail(email: string) {
    return this.userRepository.findOne({ where: { email }});
  }
}
