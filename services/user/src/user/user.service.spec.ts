import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UserProviderEnum } from '../common/enum/user.enum';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import type { UpsertUserDto } from './user.dto';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(User)) {
          return {
            create: jest
              .fn()
              .mockImplementation((upsertUserDto: UpsertUserDto) => {
                return {
                  ...upsertUserDto,
                  id: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
              }),
          };
        }
        return token;
      })
      .compile();

    service = module.get<UserService>(UserService);
  });

  it('UserService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Create user', async () => {
    const upsertUserDto = {
      name: 'tester1',
      email: 'tester1@gmail.com',
      providers: [
        {
          name: UserProviderEnum.Primary,
          picture: 'https://i0.wp.com/cdn.auth0.com/avatars/te.png?ssl=1',
        },
      ],
    };
    const user = await service.upsertWithProvider(upsertUserDto);
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('createdAt');
    expect(user).toHaveProperty('updatedAt');
  });
});
