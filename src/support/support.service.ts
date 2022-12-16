import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/services/users.service';
import { Support } from './entities/support.entity';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { SupportDto } from './support.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Support)
    private supportRepository: Repository<Support>,
    private usersService: UsersService,
    private sendGridService: SendgridService,
    private readonly configService: ConfigService,
  ) {}

  async sendSupportEmail(data: SupportDto, userId: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const suppMail = this.configService.get('APP_PLACEHOLDER_2');
    try {
      const sendMail = await this.sendGridService.send({
        to: suppMail,
        from: 'LinkWork Team <matias.viano@getwonder.tech>',
        subject: `A new issue from ${user.email}`,
        html: `<div><p>${data.msg}</p></div>`,
      });
      if (sendMail[0].statusCode != 202) {
        throw new InternalServerErrorException('Error sending email');
      }
      const newSupport = this.supportRepository.create();
      newSupport.msg = data.msg;
      newSupport.sended = sendMail[0].headers.date;
      newSupport.user = user;
      return await this.supportRepository.save(newSupport);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
