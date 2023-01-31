import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AllExceptionsFilter } from '../../utils/filters/all-exceptions.filter';
import { GetReqUser } from '../../auth/get-req-user.decorator';
import { NotifyService } from '../services/notify.service';
import { FcmTokenDto, FullNotificationDto } from '../dtos/notify.dto';
import { AccessTokenGuard } from '../../auth/jwt/accessToken.guard';

@ApiBearerAuth()
@UseFilters(AllExceptionsFilter)
@Controller('notifications')
@ApiTags('notifications')
@UseGuards(AccessTokenGuard)
export class NotifyController {
  constructor(private notificationService: NotifyService) {}

  @Post('save-token')
  @ApiOperation({
    summary: 'Guarda el token de identidad de Firebase del usuario',
  })
  async saveIdentityToken(
    @GetReqUser('id') userId,
    @Body() payload: FcmTokenDto,
  ) {
    return await this.notificationService.saveIdentityToken(userId, payload);
  }

  @Post()
  async sendMessage(@Body() payload: FullNotificationDto) {
    return this.notificationService.sendNotification(payload);
  }
}
