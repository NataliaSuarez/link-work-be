import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { UsersModule } from '../users/users.module';

import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';

import { GoogleAuthenticationService } from './googleAuthentication.service';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [UsersModule, JwtModule],
  controllers: [AuthController, GoogleController],
  providers: [
    AuthService,
    JwtService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
    GoogleService,
    GoogleAuthenticationService,
  ],
})
export class AuthModule {}
