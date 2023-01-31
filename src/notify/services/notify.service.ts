import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../../../linwork-e9364-firebase-adminsdk-n5f70-08dd1fcd8a.json';

import { UsersService } from '../../users/services/users.service';
import { FcmTokenDto } from '../dtos/notify.dto';

@Injectable()
export class NotifyService {
  private firebase: admin.app.App;
  constructor(private userService: UsersService) {
    if (!admin.apps.length) {
      this.firebase = admin.initializeApp(
        {
          credential: admin.credential.cert(serviceAccount),
        },
        'myApp',
      );
    }
  }

  async saveIdentityToken(userId: string, token: FcmTokenDto) {
    const user = await this.userService.findOneById(userId);
    return await this.userService.update(user, token);
  }

  sendNotification(message: any) {
    const messaging = this.firebase.messaging();
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
