import { Test, TestingModule } from '@nestjs/testing';

import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UserService', () => {
  let service: UserService;
  const createUserDto = {
    name: 'tester1',
    email: 'tester1@gmail.com',
    providers: [{
      name: 'auth0',
      picture: 'https://i0.wp.com/cdn.auth0.com/avatars/te.png?ssl=1'
    }]
  };

  const mockUser = {
    ...createUserDto,
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    })
    .useMocker((token) => {
      if (token === getRepositoryToken(User)) {
        return {
          create: jest.fn().mockReturnValue(mockUser),
        }
      }
    })
    .compile();

    service = module.get<UserService>(UserService);
  });

  it('UserService should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Create user', async () => {
    const user = await service.create(createUserDto);
    expect(user).toEqual(mockUser);
  });
});
