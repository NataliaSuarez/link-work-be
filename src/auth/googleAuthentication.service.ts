import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, Auth } from 'googleapis';

import { CreateUserDto } from 'src/users/dtos/users.dto';
import { UsersService } from '../users/services/users.service';

import { AuthService } from './auth.service';

@Injectable()
export class GoogleAuthenticationService {
  oauthClient: Auth.OAuth2Client;
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthService,
  ) {
    const clientID = this.configService.get('GOOGLE_AUTH_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_AUTH_CLIENT_SECRET');

    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  async registerUser(data: CreateUserDto) {
    const userData = await this.getUserData(data.googleToken);
    const user = await this.authenticationService.signUp(data);
    return user;
  }

  async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo;

    this.oauthClient.setCredentials({
      access_token: token,
    });

    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient,
    });

    return userInfoResponse.data;
  }

  async authenticate(data: CreateUserDto) {
    try {
      const tokenInfo = await this.oauthClient.getTokenInfo(data.googleToken);
      const email = tokenInfo.email;
      if (email != data.email) {
        throw new BadRequestException("Email doesn't match");
      }
      const user = await this.usersService.findByEmail(email);
      if (user) {
        return this.authenticationService.signIn({
          email: user.email,
        });
      } else {
        return this.registerUser(data);
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid google token');
    }
  }
}
