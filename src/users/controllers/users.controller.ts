import { Body, Controller, Get, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CreateUserDto } from '../dtos/users.dto';
import { User } from '../entities/user.entity';

import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  add(@Body() user: CreateUserDto): Observable<User> {
    console.log('user');
    return this.usersService.add(user);
  }

  @Get()
  findAll(): Observable<User[]> {
    console.log('something');
    return this.usersService.findAll();
  }
}
