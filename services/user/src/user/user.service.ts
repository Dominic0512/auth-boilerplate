import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UserProvider } from './entities/user-provider.entity';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async create({ providers, ...rest }: CreateUserDto) {
    const userProviders = providers.map((provider) => {
      const userProvider = new UserProvider();
      userProvider.name = provider.name;
      userProvider.picture = provider.picture;
      return userProvider;
    });

    return this.userRepository.create({
      ...rest,
      providers: userProviders
    });
  }
}
