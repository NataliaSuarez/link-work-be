import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import VerificationTokenPayload from './verificationTokenPayload.interface';
import { SendgridService } from '../../sendgrid/sendgrid.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private sendGridService: SendgridService,
    private userService: UsersService,
  ) {}

  public sendVerificationLink(email: string, userName: string) {
    const payload: VerificationTokenPayload = { email };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    const url = `${this.configService.get(
      'EMAIL_CONFIRMATION_URL',
    )}?token=${token}`;

    return this.sendGridService.send({
      to: email,
      from: 'LinkWork Team <matias.viano@getwonder.tech>',
      subject: `Welcome to LinkWork!`,
      templateId: 'd-50336614d4c24651baf4f4a44daf38e9',
      dynamicTemplateData: {
        first_name: userName,
        url_confirm: url,
      },
    });
  }

  public async confirmEmail(email: string) {
    const user = await this.userService.findByEmail(email);
    if (user.verified) {
      throw new BadRequestException('Email already confirmed');
    }
    await this.userService.verifyUser(email);
    return `${email} verified ok`;
  }

  public async decodeConfirmationToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }

  public async resendConfirmationLink(email: string) {
    const user = await this.userService.findByEmail(email);
    if (user.verified) {
      throw new BadRequestException('Email already confirmed');
    }
    await this.sendVerificationLink(user.email, user.firstName);
    return { message: `Email sended to ${email}` };
  }
}
