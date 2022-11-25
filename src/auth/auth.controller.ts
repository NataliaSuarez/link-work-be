import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from '../users/dtos/users.dto';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard } from './jwt/accessToken.guard';
import { RefreshTokenGuard } from 'src/auth/jwt/refreshToken.guard';
import { GoogleAuthenticationService } from './googleAuthentication.service';
import { GetReqUser } from './get-req-user.decorator';
import { RegisterType } from 'src/users/entities/user.entity';
import { AppleService } from './apple/apple.service';
import { EmailDto } from './mail/confirmEmail.dto';
@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly googleAuthenticationService: GoogleAuthenticationService,
    private appleService: AppleService,
  ) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Sign up an user account' })
  async signup(@Body() createUserDto: CreateUserDto) {
    if (createUserDto.registerType == RegisterType.EMAIL_AND_PASSWORD) {
      return await this.authService.signUp(createUserDto);
    } else if (createUserDto.registerType === RegisterType.GOOGLE) {
      return await this.googleAuthenticationService.authenticate(createUserDto);
    }
  }

  @Post('sign-in')
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
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Refresh auth tokens' })
  async refreshTokens(@Req() req: Request) {
    const email = req.user['email'];
    const refreshToken = req.user['refreshToken'];
    return await this.authService.refreshTokens(email, refreshToken);
  }

  @Post('apple/redirect')
  @ApiOperation({
    summary:
      'Endpoint al que apunta automáticamente el login de apple para realizar registro con Apple ID',
  })
  async redirect(@Body() payload): Promise<any> {
    if (payload.id_token) {
      return this.appleService.registerByIDtoken(payload);
    }
    throw new UnauthorizedException('Unauthorized');
  }
}
