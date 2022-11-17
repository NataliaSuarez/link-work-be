import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from '../auth.service';

@Injectable()
export class AppleService {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async registerByIDtoken(payload: any) {
    try {
      //Decode the id_token which returned from Apple,
      const decodedObj = await this.jwtService.decode(payload.id_token);
      //const accountId = decodedObj.sub || '';

      if (decodedObj.hasOwnProperty('email')) {
        const email = decodedObj['email'];

        // Extract the firstName and lastName from the user, but they are only shown in the first time.
        if (payload.hasOwnProperty('user')) {
          const userData = JSON.parse(payload.user);
          const { firstName, lastName } = userData.name || {};
          const userByApple = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            registerType: 2,
            verified: true,
            role: 1,
          };
          return this.authService.signUp(userByApple);
        }
        throw new BadRequestException('User name is required');
      }

      throw new BadRequestException('Email is required');
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
