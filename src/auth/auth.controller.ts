import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from '../users/dtos/users.dto';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
import { GoogleAuthenticationService } from './googleAuthentication.service';
@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Sign up an user account' })
  async signup(@Body() createUserDto: CreateUserDto) {
    if (createUserDto.registerType == 0) {
      return await this.authService.signUp(createUserDto);
    } else if (createUserDto.registerType === 1) {
      return await this.googleAuthenticationService.authenticate(createUserDto);
    }
  }

  @Post('sign-in')
  @ApiOperation({ summary: 'Sign in an existing user' })
  async signin(@Body() data: AuthDto) {
    return await this.authService.signIn(data);
  }

  @UseGuards(AccessTokenGuard)
  @Get('log-out')
  @ApiOperation({ summary: 'Log out an existing user' })
  async logout(@Req() req: Request) {
    await this.authService.logout(req.user['sub']);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  @ApiOperation({ summary: 'Refresh auth tokens' })
  async refreshTokens(@Req() req: Request) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return await this.authService.refreshTokens(userId, refreshToken);
  }
}
