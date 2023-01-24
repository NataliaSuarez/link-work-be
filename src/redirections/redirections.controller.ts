import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Redirect,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('redirect')
@ApiTags('redirect')
export class RedirectionsController {
  @Get('offers/:offerId')
  @Redirect('https://docs.nestjs.com', 302)
  redirectOffer(@Param('offerId', ParseUUIDPipe) offerId: string) {
    return { url: `poc://deeplink.flutter.dev/offers/${offerId}` };
  }
}
