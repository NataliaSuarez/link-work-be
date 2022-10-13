import {
  Get,
  Controller,
  Body,
  ParseIntPipe,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { FilterUsersDto, UpdateUserDto } from '../dtos/users.dto';
import { UsersService } from '../services/users.service';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AccessTokenGuard)
  @Patch(':id/deactivate')
  async deactivate(@Param('id') userId: number) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.usersService.deactivate(userId);
  }

  @UseGuards(AccessTokenGuard)
  @Patch(':id/reactivate')
  async reactivate(@Param('id') userId: number) {
    return await this.usersService.deactivate(userId, false);
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
  async update(@Param('id') userId: number, @Body() payload: UpdateUserDto) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.usersService.update(user, payload);
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.usersService.delete(id);
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async getUsers(@Query() params: FilterUsersDto) {
    return await this.usersService.findAllFiltered(params);
  }
}
