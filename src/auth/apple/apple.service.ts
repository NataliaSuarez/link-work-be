import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../../users/services/users.service';
import { AuthService } from '../auth.service';

@Injectable()
export class AppleService {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  async registerByIDtoken(payload: any) {
    try {
      //Decode the id_token which returned from Apple,
      const decodedObj = await this.jwtService.decode(payload.id_token);
      //const accountId = decodedObj.sub || '';

      if (decodedObj.hasOwnProperty('email')) {
        const email = decodedObj['email'];

        const userExists = await this.usersService.findByEmail(email);

        if (userExists) {
          if (userExists.registerType === 2) {
            await this.authService.signIn({
              email: email,
            });
            return JSON.parse(JSON.stringify(decodedObj));
          }
          //throw new ConflictException(`User ${email} already exists`);
          return { error: `User ${email} already exists` };
        }

        // Extract the firstName and lastName from the user, but they are only shown in the first time.
        //if (payload.hasOwnProperty('user')) {
        const userData = JSON.parse(payload.user);
        const { firstName, lastName } = userData.name || {};
        const userByApple = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          registerType: 2,
          verified: true,
          role: 0,
        };
        await this.authService.signUp(userByApple);
        return JSON.parse(JSON.stringify(decodedObj));
        //}
        //throw new BadRequestException('User name is required');
      }

      //throw new BadRequestException('Email is required');
      return { error: 'Email is required' };
    } catch (error) {
      console.error(error);
      throw new HttpException(error.response, error.response.statusCode);
    }
  }
}
