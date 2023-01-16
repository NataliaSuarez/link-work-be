import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

import { CreateUserDto } from '../users/dtos/users.dto';
import { UsersService } from '../users/services/users.service';
import { AuthDto, RetrievePasswordDto } from './dto/auth.dto';
import { JwtPayload } from './jwt/jwt-payload.interface';
import { RegisterType, User } from '../users/entities/user.entity';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { EmailConfirmationService } from './mail/emailConfirmation.service';
import { EmailDto } from './mail/confirmEmail.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sendGridService: SendgridService,
    private emailService: EmailConfirmationService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    try {
      const userExists = await this.usersService.findByEmail(
        createUserDto.email,
      );

      if (userExists) {
        throw new BadRequestException(
          `User ${createUserDto.email} already exists`,
        );
      }

      if (createUserDto.registerType === RegisterType.APPLE) {
        const newUser = await this.usersService.create(createUserDto);
        const tokens = await this.getTokens({
          sub: newUser.id,
          email: newUser.email,
          role: newUser.role,
        });

        await this.updateRefreshToken(newUser.id, tokens.refreshToken);

        const ObjRta = {
          tokens: tokens,
          userData: {
            id: newUser.id,
            role: newUser.role,
          },
        };

        return ObjRta;
      }

      if (createUserDto.registerType === RegisterType.GOOGLE) {
        const newUser = await this.usersService.create(createUserDto);
        const tokens = await this.getTokens({
          sub: newUser.id,
          email: newUser.email,
          role: newUser.role,
        });
        await this.updateRefreshToken(newUser.id, tokens.refreshToken);
        const gObjRta = {
          tokens: tokens,
          userData: {
            id: newUser.id,
            role: newUser.role,
          },
        };
        console.log(`User ${newUser.email} registered with Google`);
        return gObjRta;
      }
      if (!createUserDto.password) {
        throw new BadRequestException('Password invalid');
      }
      if (createUserDto.password != createUserDto.repeatPassword) {
        throw new BadRequestException('The password is not the same');
      }
      // Hash password
      const hash = await this.hashData(createUserDto.password);
      const newUser = await this.usersService.create({
        ...createUserDto,
        password: hash,
      });
      const tokens = await this.getTokens({
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });
      await this.updateRefreshToken(newUser.id, tokens.refreshToken);
      this.emailService.sendVerificationLink(newUser.email, newUser.firstName);
      console.log(`User ${newUser.email} registered`);
      return { message: `Email sended to ${newUser.email}` };
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async signIn({ email, password }: AuthDto) {
    const checkUser = await this.usersService.findByEmail(email);
    if (!checkUser) throw new ForbiddenException('User does not exist');
    if (checkUser.desactivatedAt) {
      const reactivateUser = await this.usersService.desactivate(
        checkUser.id,
        false,
      );
      console.log(reactivateUser);
    }
    const user = await this.usersService.findCredentials(email);
    if (!user) throw new BadRequestException('Incorrect email or password');
    if (password) {
      const passwordMatches = await argon2.verify(user.password, password);
      if (!passwordMatches)
        throw new BadRequestException('Incorrect email or password');
    } else {
      if (user.registerType === 0) {
        throw new BadRequestException('User already exists');
      }
    }
    const tokens = await this.getTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    await this.usersService.update(user, { lastLogin: new Date() });
    const objRta = {
      tokens: tokens,
      userData: {
        id: user.id,
        role: user.role,
      },
    };
    return objRta;
  }

  async logout(userId: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return await this.usersService.update(user, { refreshToken: null });
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(user, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          ...payload,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '600m',
        },
      ),
      this.jwtService.signAsync(
        {
          ...payload,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '30d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userEmail: string, refreshToken: string) {
    const user = await this.usersService.findCredentials(userEmail);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }
    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }
    const tokens = await this.getTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async forgotPassword(emailDto: EmailDto) {
    const user = await this.usersService.findByEmail(emailDto.email);
    if (!user) {
      return { message: 'An email was sent if the user exists' };
    }
    try {
      const token = await this.signUser(user);
      const hashedToken = await this.hashData(token);
      await this.usersService.update(user, { retrieveToken: hashedToken });
      const forgotLink = `https://fr21309mu.getwonder.tech/auth/forgotPassword?token=${token}`;
      const firstMsg = 'Here is your request for password recovery';
      const secondMsg =
        'Please click the button below, if it was not you who requested it, ignore the message';
      const buttonMsg = 'Set New Password';
      const subjectMsg = 'Password recovery request';
      await this.sendGridService.send({
        to: user.email,
        from: 'LinkWork Team <matias.viano@getwonder.tech>',
        subject: `Forgot Password`,
        templateId: 'd-50336614d4c24651baf4f4a44daf38e9',
        dynamicTemplateData: {
          first_name: user.firstName,
          url_confirm: forgotLink,
          first_msg: firstMsg,
          second_msg: secondMsg,
          button_msg: buttonMsg,
          subject_msg: subjectMsg,
        },
      });
      return { message: 'An email was sent if the user exists' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async signUser(user: User): Promise<string> {
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: '120m',
    });

    return token;
  }

  async changePassword(data: RetrievePasswordDto) {
    const decodedToken: any = await this.jwtService.decode(data.retrieveToken);
    const user = await this.usersService.findByEmail(decodedToken.email);
    const tokenMatches = await argon2.verify(
      user.retrieveToken,
      data.retrieveToken,
    );
    if (!tokenMatches) {
      throw new ForbiddenException('Access Denied');
    }
    await this.usersService.update(user, {
      password: data.newPassword,
      repeatPassword: data.repeatNewPassword,
      retrieveToken: null,
    });
    return { message: 'Password changed succesfully' };
  }
}
