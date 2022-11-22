import {
  Controller,
  ClassSerializerInterceptor,
  UseInterceptors,
  Get,
  Query,
  Post,
  Body,
} from '@nestjs/common';

import { ConfirmEmailDto, EmailDto } from './confirmEmail.dto';
import { EmailConfirmationService } from './emailConfirmation.service';

@Controller('email-confirmation')
@UseInterceptors(ClassSerializerInterceptor)
export class EmailConfirmationController {
  constructor(
    private readonly emailConfirmationService: EmailConfirmationService,
  ) {}

  @Get('confirm-email')
  async confirm(@Query() params: ConfirmEmailDto) {
    const email = await this.emailConfirmationService.decodeConfirmationToken(
      params.token,
    );
    return await this.emailConfirmationService.confirmEmail(email);
  }

  @Post('resend-confirmation-link')
  async resendConfirmationLink(@Body() payload: EmailDto) {
    return await this.emailConfirmationService.resendConfirmationLink(
      payload.email,
    );
  }
}
