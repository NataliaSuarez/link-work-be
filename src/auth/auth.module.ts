import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy } from './jwt/accessToken.strategy';
import { RefreshTokenStrategy } from './jwt/refreshToken.strategy';
import { UsersModule } from '../users/users.module';

import { GoogleAuthenticationService } from './googleAuthentication.service';

import { AppleController } from './apple/apple.controller';
import { AppleService } from './apple/apple.service';
import { AppleStrategy } from './apple/apple.strategy';

@Module({
  imports: [UsersModule, JwtModule],
  controllers: [AuthController, AppleController],
  providers: [
    AuthService,
    JwtService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleAuthenticationService,
    AppleService,
    AppleStrategy,
  ],
})
export class AuthModule {}
