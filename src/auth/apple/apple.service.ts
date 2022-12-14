import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dtos/users.dto';

import { UsersService } from '../../users/services/users.service';
import { AuthService } from '../auth.service';

@Injectable()
export class AppleService {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  async signInWithApple(createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }
}
