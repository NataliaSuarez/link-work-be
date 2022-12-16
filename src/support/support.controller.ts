import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetReqUser } from '../auth/get-req-user.decorator';
import { AccessTokenGuard } from '../auth/jwt/accessToken.guard';
import { EmailConfirmationGuard } from '../auth/mail/emailConfirmation.guard';
import { SupportDto } from './support.dto';
import { SupportService } from './support.service';

@Controller('support')
@ApiTags('support')
@ApiBearerAuth()
@UseGuards(EmailConfirmationGuard)
@UseGuards(AccessTokenGuard)
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post('send-mail')
  @ApiOperation({ summary: 'Enviar correo a soporte' })
  async sendSupportMail(
    @GetReqUser('id') reqUserId,
    @Body() payload: SupportDto,
  ) {
    return await this.supportService.sendSupportEmail(payload, reqUserId);
  }
}
