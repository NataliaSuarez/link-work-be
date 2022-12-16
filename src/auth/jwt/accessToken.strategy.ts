import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users.service';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const account = await this.usersService.findByEmail(payload.email);

    if (!account) {
      throw new UnauthorizedException('Invalid access token');
    } else if (account.desactivatedAt !== null) {
      throw new UnauthorizedException('User account deactivated');
    }

    return account;
  }
}
