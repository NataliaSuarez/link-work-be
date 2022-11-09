import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

import { CreateUserDto } from '../users/dtos/users.dto';
import { UsersService } from '../users/services/users.service';
import { AuthDto } from './dto/auth.dto';
import { JwtPayload } from './jwt/jwt-payload.interface';
import { RegisterType } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<any> {
    const userExists = await this.usersService.findByEmail(createUserDto.email);
    if (userExists) {
      throw new ConflictException('User already exists');
    }

    if (createUserDto.registerType === RegisterType.GOOGLE) {
      const newUser = await this.usersService.createWithGoogle(createUserDto);
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
      return gObjRta;
    }
    if (!createUserDto.password) {
      throw new BadRequestException('Password invalid');
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
    const objRta = {
      tokens: tokens,
      userData: {
        id: newUser.id,
        role: newUser.role,
      },
    };
    return objRta;
  }

  async signIn({ email, password }: AuthDto) {
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
}
