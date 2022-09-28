import {
  Controller,
  Post,
  ClassSerializerInterceptor,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { GoogleAuthenticationService } from './googleAuthentication.service';
import { CreateUserDto } from 'src/users/dtos/users.dto';

@ApiTags('Google-Auth')
@Controller('google-authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class GoogleAuthenticationController {
  constructor(
    private readonly googleAuthenticationService: GoogleAuthenticationService,
  ) {}

  @Post()
  async authenticate(@Body() data: CreateUserDto) {
    const userTokens = await this.googleAuthenticationService.authenticate(
      data,
    );
    return userTokens;
  }
}
