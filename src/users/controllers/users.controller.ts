import {
  Get,
  Controller,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Patch,
  NotFoundException,
  UseInterceptors,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { FilterUsersDto, UpdateUserDto } from '../dtos/users.dto';
import { UsersService } from '../services/users.service';
import { AccessTokenGuard } from 'src/auth/jwt/accessToken.guard';

@Controller('users')
@ApiTags('users')
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Patch(':id/deactivate')
  async deactivate(@Param('id') userId: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.usersService.deactivate(userId);
  }

  @Patch(':id/reactivate')
  async reactivate(@Param('id') userId: string) {
    return await this.usersService.deactivate(userId, false);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return await this.usersService.findOneById(id);
  }

  @Post(':id/upload-profile-img')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tmp/uploads/profileImgs',
      }),
    }),
  )
  async addProfileImg(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.usersService.uploadProfileImg(id, file);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.usersService.update(user, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }

  @Get()
  async getUsers(@Query() params: FilterUsersDto) {
    return await this.usersService.findAllFiltered(params);
  }
}
