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

    const firstMsg = 'Thanks for signing up';
    const secondMsg =
      'Please verify your email address to access a huge network of job offers.';
    const buttonMsg = 'Verify Email Now';
    const subjectMsg = `Welcome to LinkWork, ${userName}`;

    return this.sendGridService.send({
      to: email,
      from: 'Extra Team <admin@extraworks.app>',
      subject: `Welcome to LinkWork!`,
      templateId: 'd-92c1cbe506d045619a97c2c9a109b9bb',
      dynamicTemplateData: {
        first_name: userName,
        url_confirm: url,
        first_msg: firstMsg,
        second_msg: secondMsg,
        button_msg: buttonMsg,
        subject_msg: subjectMsg,
      },
    });
  }

  public async confirmEmail(email: string) {
    try {
      const user = await this.userService.findByEmail(email);
      if (user.verified) {
        throw new BadRequestException('Email already confirmed');
      }
      await this.userService.verifyUser(email);
      return { message: `${email} verified ok` };
    } catch (error) {
      return { message: `${error.message}` };
    }
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
        return { message: 'Email confirmation token expired' };
      }
      return { message: 'Bad confirmation token' };
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
