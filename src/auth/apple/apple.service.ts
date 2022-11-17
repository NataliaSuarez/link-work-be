import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppleService {
  constructor(private jwtService: JwtService) {}

  async registerByIDtoken(payload: any) {
    //You can decode the id_token which returned from Apple,
    const decodedObj = await this.jwtService.decode(payload.id_token);
    const accountId = decodedObj.sub || '';
    //console.info(`Apple Account ID: ${accountId}`);
    let email = '';

    //Email address
    if (decodedObj.hasOwnProperty('email')) {
      email = decodedObj['email'];
      //console.info(`Apple Email: ${email}`);
    }

    //You can also extract the firstName and lastName from the user, but they are only shown in the first time.
    if (payload.hasOwnProperty('user')) {
      const userData = JSON.parse(payload.user);
      //const { firstName, lastName } = userData.name || {};
      return {
        accountId: accountId,
        email: email,
        userData: userData,
      };
    }
    return {
      accountId: accountId,
      email: email,
    };
    //.... you logic for registration and login here
  }
}
