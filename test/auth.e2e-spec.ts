import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { generateCreatingUser } from '../src/utils/testing/users.fake';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/users/dtos/users.dto';
import { User } from '../src/users/entities/user.entity';
import { clearDBUser } from '../src/utils/testing/db-functions';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server;

  const mockCreateUser: CreateUserDto = generateCreatingUser();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await clearDBUser(User, mockCreateUser.email);
    await Promise.all([app.close()]);
  });

  describe('/auth/sign-up (POST)', () => {
    it('should register an user', async () => {
      const response = await request(server)
        .post('/auth/sign-up')
        .send(mockCreateUser)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('message');
    });

    it('should not register a new user if the passed email already exists', async () => {
      return await request(server)
        .post('/auth/sign-up')
        .send(mockCreateUser)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('auth/sign-in (POST)', () => {
    it('should not login for an unregistered user', () => {
      return request(server)
        .post('/auth/sign-in')
        .set('Accept', 'application/json')
        .send({ email: 'doesnot@exist.com', password: 'password' })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should login and return access data for a registered user', async () => {
      const response = await request(server)
        .post('/auth/sign-in')
        .set('Accept', 'application/json')
        .send({
          email: mockCreateUser.email,
          password: mockCreateUser.password,
        })
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('tokens');
      expect(response.body).toHaveProperty('userData');
      expect(response.body.tokens.accessToken).toMatch(
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
      ); // jwt regex
      expect(response.body.tokens.refreshToken).toMatch(
        /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
      ); // jwt regex
    });

    it('should fail to authenticate user with an incorrect password', async () => {
      const response = await request(server)
        .post('/sign-in')
        .send({ email: mockCreateUser.email, password: 'wrong' })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.tokens).not.toBeDefined();
    });
  });
});
