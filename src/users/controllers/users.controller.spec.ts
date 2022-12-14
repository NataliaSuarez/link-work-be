import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dtos/users.dto';

describe('UsersController', () => {
  let controller: UsersController;
  const mockUsersService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should update an user', () => {
    const updateUserDto: UpdateUserDto = {
      firstName: 'User',
      lastName: 'Employer',
      email: 'user.employer@getwonder.tech',
      registerType: 0,
      verified: false,
      blocked: false,
      blockedReason: 0,
      failedAttemptsToLogin: 0,
      role: 1,
      profileStatus: 0,
      retrieveToken: null,
    };
    const userId = uuidv4();

    expect(controller.update(userId, updateUserDto)).toEqual({
      id: userId,
      ...updateUserDto,
    });
  });
});
