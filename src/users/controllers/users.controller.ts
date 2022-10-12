import {
  Get,
  Post,
  Controller,
  Body,
  ParseIntPipe,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  CreateUserDto,
  FilterUsersDto,
  UpdateUserDto,
} from '../dtos/users.dto';
import { UsersService } from '../services/users.service';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getUsers(@Query() params: FilterUsersDto) {
    return this.usersService.findAll(params);
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.findOneById(id);
  }

  // @Post()
  // create(@Body() payload: CreateUserDto) {
  //   return this.usersService.create(payload);
  // }

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() payload: UpdateUserDto) {
    return await this.usersService.update(id, payload);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.usersService.remove(id);
  }

  }
}
