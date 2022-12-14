import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import * as request from 'supertest';

import { UsersModule } from '../src/users/users.module';
import { User } from '../src/users/entities/user.entity';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  const mockUsersRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue('')
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUsersRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer()).get('/users').expect(200);
  });
});
