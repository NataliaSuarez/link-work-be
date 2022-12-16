import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';

import { CreateUserDto } from '../src/users/dtos/users.dto';

describe('AuthController (e2e)', () => {
  const authUrl = `http://localhost/auth`;

  const mockUser: CreateUserDto = {
    firstName: 'User',
    lastName: 'Employer',
    email: 'user.employer@getwonder.tech',
    password: 'sStrinsStr33',
    repeatPassword: 'sStrinsStr33',
    registerType: 0,
    role: 1,
  };

  describe('/auth/sign-up (POST)', () => {
    it('should register an user and return the new user object', () => {
      return request(authUrl)
        .post('/sign-up')
        .set('Accept', 'application/json')
        .send(mockUser)
        .expect((response: request.Response) => {
          const resp = response.body;
          expect(typeof resp).toBe('object');
          expect(resp).toHaveProperty('message');
        })
        .expect(HttpStatus.CREATED);
    });

    it('should not register a new user if the passed email already exists', () => {
      return request(authUrl)
        .post('/sign-up')
        .set('Accept', 'application/json')
        .send(mockUser)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('auth/sign.in (POST)', () => {
    it('should not login for an unregistered user', () => {
      return request(authUrl)
        .post('/sign-in')
        .set('Accept', 'application/json')
        .send({ email: 'doesnot@exist.com', password: 'password' })
        .expect((response: request.Response) => {
          const { tokens } = response.body;

          expect(tokens).toBeUndefined();
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should login and return access data for a registered user', () => {
      return request(authUrl)
        .post('/sign-in')
        .set('Accept', 'application/json')
        .send({ email: mockUser.email, password: mockUser.password })
        .expect((response: request.Response) => {
          const { userData } = response.body;
          expect(userData.role).toEqual(mockUser.role);
          expect(HttpStatus.OK);
        });
    });
  });
});
