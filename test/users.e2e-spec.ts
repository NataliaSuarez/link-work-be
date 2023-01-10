import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

import { AppModule } from '../src/app.module';
import { AccessTokenGuard } from '../src/auth/jwt/accessToken.guard';
import { generateCreatingUser } from '../src/utils/testing/users.fake';
import { CreateUserDto } from '../src/users/dtos/users.dto';
import { clearDBData, seedDBData } from '../src/utils/testing/db-functions';
import { User } from '../src/users/entities/user.entity';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let server;

  const mockArrayCreateUser: CreateUserDto[] = [
    generateCreatingUser(),
    generateCreatingUser(),
    generateCreatingUser(),
  ];

  let arrayCreatedUsers: User[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    arrayCreatedUsers = await seedDBData(User, mockArrayCreateUser);
  });

  afterAll(async () => {
    await clearDBData(User, arrayCreatedUsers);
    await Promise.all([app.close()]);
  });

  describe('/users (GET)', () => {
    it('should return an array of users', async () => {
      const response = await request(server)
        .get('/users?limit=10&offset=0&role=1')
        .expect(HttpStatus.OK);

      expect(response.body.length).toBeLessThanOrEqual(10);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      expect(response.body[0].role).toEqual(1);
    });
  });

  describe('/users/{id} (GET)', () => {
    it('should return user data by id', async () => {
      const response = await request(server)
        .get(`/users/${arrayCreatedUsers[0].id}`)
        .expect(HttpStatus.OK);

      expect(response.body.email).toEqual(arrayCreatedUsers[0].email);
    });
    it('should return an error if user does not exists', async () => {
      return await request(server)
        .get(`/users/${uuidv4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('/users/{id} (PUT)', () => {
    it('should return updated user', async () => {
      const payload = {
        appleIdIdentifier: 'string',
      };
      const response = await request(server)
        .put(`/users/${arrayCreatedUsers[1].id}`)
        .send(payload)
        .expect(HttpStatus.OK);

      expect(response.body.appleIdIdentifier).toEqual(
        payload.appleIdIdentifier,
      );
    });
  });

  describe('/users/{id}/desactivate (PATCH)', () => {
    it('should desactivate an user by id', async () => {
      const response = await request(server)
        .patch(`/users/${arrayCreatedUsers[2].id}/desactivate`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual(
        `User ${arrayCreatedUsers[2].email} desactivated`,
      );
    });
  });

  describe('/users/{id} (DELETE)', () => {
    it('should delete a given user', async () => {
      const response = await request(server)
        .delete(`/users/${arrayCreatedUsers[0].id}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual('User deleted permanently');
    });
  });
});
