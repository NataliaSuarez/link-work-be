import {
  Controller,
  ClassSerializerInterceptor,
  UseInterceptors,
  Get,
  Query,
  Post,
  Body,
  Render,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ConfirmEmailDto, EmailDto } from './confirmEmail.dto';
import { EmailConfirmationService } from './emailConfirmation.service';

@Controller('email-confirmation')
@ApiTags('email-confirmation')
@UseInterceptors(ClassSerializerInterceptor)
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @Get('confirm-email')
  @Render('confirmation.hbs')
  @ApiOperation({ summary: 'Endpoint al que le pega la confirmación del mail' })
  async confirm(@Query() params: ConfirmEmailDto) {
    const email = await this.emailConfirmationService.decodeConfirmationToken(
      params.token,
    );
    if (email.message) {
      return email;
    }
    return await this.emailConfirmationService.confirmEmail(email);
  }

  @Post('resend-confirmation-link')
  @ApiOperation({ summary: 'Reenviar mail de confirmación de usuario' })
  async resendConfirmationLink(@Body() payload: EmailDto) {
    return await this.emailConfirmationService.resendConfirmationLink(
      payload.email,
    );
  }
}
