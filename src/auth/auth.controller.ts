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
import { RefreshTokenGuard } from 'src/auth/jwt/refreshToken.guard';
import { GoogleAuthenticationService } from './googleAuthentication.service';
import { GetReqUser } from './get-req-user.decorator';
import { RegisterType } from 'src/users/entities/user.entity';
import { AppleService } from './apple/apple.service';
import { EmailDto } from './mail/confirmEmail.dto';
import { UsersService } from 'src/users/services/users.service';
import { AllExceptionsFilter } from '../utils/filters/all-exceptions.filter';

@UseFilters(AllExceptionsFilter)
@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly googleAuthenticationService: GoogleAuthenticationService,
    private appleService: AppleService,
    private readonly userService: UsersService,
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
  @Redirect()
  @ApiOperation({
    summary:
      'Endpoint al que apunta automáticamente el login de apple para realizar registro con Apple ID',
  })
  async redirect(@Body() payload, @Res() res: Response) {
    if (payload.id_token) {
      const response = await this.appleService.registerByIDtoken(payload);
      if (response.error) {
        const errorUrl = `intent://callback?error=${response.error}#Intent;package=com.example.linkwork;scheme=signinwithapple;end`;
        return { url: errorUrl };
      }
      const redirectUrl = `intent://callback?email=${response.email}&email_verified=${response.email_verified}#Intent;package=com.example.linkwork;scheme=signinwithapple;end`;
      return { url: redirectUrl };
    }
    //throw new UnauthorizedException('Unauthorized');
    const errorUrl =
      'intent://callback?error=Unauthorized#Intent;package=com.example.linkwork;scheme=signinwithapple;end';
    return { url: errorUrl };
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
