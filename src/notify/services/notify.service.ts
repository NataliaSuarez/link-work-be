import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

import { UsersService } from '../../users/services/users.service';
import { FcmTokenDto } from '../dtos/notify.dto';

@Injectable()
export class NotifyService {
  private firebase: admin.app.App;
  constructor(private userService: UsersService) {}

  async saveIdentityToken(userId: string, token: FcmTokenDto) {
    const user = await this.userService.findOneById(userId);
    return await this.userService.update(user, token);
  }

  sendNotification(message: any) {
    const messaging = admin.messaging();
    messaging
      .send(message)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
