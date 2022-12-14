import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  Render,
  UseFilters,
  Res,
  Redirect,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from '../users/dtos/users.dto';
import { AuthService } from './auth.service';
import { AuthDto, RetrievePasswordDto } from './dto/auth.dto';
import { AccessTokenGuard } from './jwt/accessToken.guard';
import { RefreshTokenGuard } from '../auth/jwt/refreshToken.guard';
import { GoogleAuthenticationService } from './googleAuthentication.service';
import { GetReqUser } from './get-req-user.decorator';
import { RegisterType } from '../users/entities/user.entity';
import { AppleService } from './apple/apple.service';
import { EmailDto } from './mail/confirmEmail.dto';
import { UsersService } from '../users/services/users.service';
import { AllExceptionsFilter } from '../utils/filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { TokenResponse } from './entities/token_responde.entity';
import { json } from 'stream/consumers';
import AppleAuth, { AppleAuthConfig } from 'apple-auth';
import * as jwt from 'jsonwebtoken';

// const AppleAuth = require('apple-auth');
// const jwt = require('jsonwebtoken');

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly googleAuthenticationService: GoogleAuthenticationService,
    private appleService: AppleService,
    private readonly userService: UsersService,
    private configService: ConfigService,
  ) {}

  @Get('forgotPassword')
  @ApiOperation({ summary: 'Prueba HTML recuperación de password' })
  @Render('password.hbs')
  async forgotPassword() {
    return { message: 'Hello world!' };
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Confirmación cambio de password' })
  @Render('confirmation.hbs')
  async resetPassword(@Body() payload: any) {
    const data: RetrievePasswordDto = {
      newPassword: payload.passwordNew1,
      repeatNewPassword: payload.passwordNew2,
      retrieveToken: payload.token,
    };
    return await this.authService.changePassword(data);
  }

  @Post('sign-up')
  @UseFilters(AllExceptionsFilter)
  @ApiOperation({ summary: 'Sign up an user account' })
  async signup(@Body() createUserDto: CreateUserDto) {
    switch (createUserDto.registerType) {
      case RegisterType.EMAIL_AND_PASSWORD:
        return await this.authService.signUp(createUserDto);
      case RegisterType.GOOGLE:
        return await this.googleAuthenticationService.authenticate(
          createUserDto,
        );
      case RegisterType.APPLE:
        return await this.appleService.signInWithApple(createUserDto);
    }
  }

  @Post('sign-in')
  @UseFilters(AllExceptionsFilter)
  @ApiOperation({ summary: 'Sign in an existing user' })
  async signin(@Body() data: AuthDto) {
    return await this.authService.signIn(data);
  }

  @Post('retrieve-password')
  @ApiOperation({ summary: 'Envio de correo para recuperar contraseña' })
  async retrievePassword(@Body() payload: EmailDto) {
    return await this.authService.forgotPassword(payload);
  }

  @Get('log-out')
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Log out an existing user' })
  async logout(@GetReqUser('id') reqUserId) {
    await this.authService.logout(reqUserId);
  }

  @Get('refresh')
  @UseFilters(AllExceptionsFilter)
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Refresh auth tokens' })
  async refreshTokens(@Req() req: Request) {
    const email = req.user['email'];
    const refreshToken = req.user['refreshToken'];
    return await this.authService.refreshTokens(email, refreshToken);
  }

  @Post('apple/redirect')
  @Redirect('https://docs.nestjs.com', 307)
  @ApiOperation({
    summary:
      'Callback consumido por Apple para devolver las credenciles utilizadas para realizar el SignIn.',
  })
  async appleRedirect(@Req() request, @Res() response: Response) {
    const redirect = `intent://callback?${new URLSearchParams(
      request.body,
    ).toString()}#Intent;package=com.example.linkwork;scheme=signinwithapple;end`;

    return { url: redirect };
  }

  @Post('apple/sign_in_with_apple')
  async signInWithApple(@Req() request: Request, @Res() response: Response) {
    try {
      const pathToAppleKeyFile = join(
        process.cwd(),
        process.env.APPLE_KEYFILE_PATH,
      );

      const client_id =
        request.query.useBundleId === 'true'
          ? process.env.APPLE_BUNDLE_ID
          : process.env.APPLE_SERVICE_ID;

      const config: AppleAuthConfig = {
        client_id: client_id,
        team_id: this.configService.get('APPLE_TEAMID'),
        redirect_uri: this.configService.get('APPLE_CALLBACK'),
        key_id: this.configService.get('APPLE_KEYID'),
        scope: '',
      };
      const auth = new AppleAuth(config, pathToAppleKeyFile, 'file');

      const accessToken = await auth.accessToken(request.query.code[0]);

      console.log('access token', accessToken);

      const idToken = jwt.decode(accessToken.id_token, { json: true });

      const userID = idToken.sub;

      const userEmail = idToken.email;
      const userName = `${request.query.firstName} ${request.query.lastName}`;

      const sessionID = `NEW SESSION ID for ${userID} / ${userEmail} / ${userName}`;

      return response.json({ sessionId: sessionID });
    } catch (error) {
      console.error(error);

      return { error: error };
    }
  }

  @Post('exists-by-email')
  @ApiOperation({ summary: 'Verificar si un usuario existe según email' })
  async userExists(@Body() payload: EmailDto): Promise<boolean> {
    const user = await this.userService.findByEmail(payload.email);
    if (user) {
      return true;
    } else {
      return false;
    }
  }
}
