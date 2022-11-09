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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { FilterUsersDto, UpdateUserDto } from '../dtos/users.dto';
import { UsersService } from '../services/users.service';
import { AccessTokenGuard } from 'src/auth/jwt/accessToken.guard';
import { GetReqUser } from 'src/auth/get-req-user.decorator';

@Controller('users')
@ApiTags('users')
@UseGuards(AccessTokenGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Filtro y paginación de usuarios' })
  async getUsers(@Query() params: FilterUsersDto) {
    return await this.usersService.findAllFiltered(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async get(@Param('id') id: string) {
    return await this.usersService.findOneById(id);
  }

  @Post('upload-profile-img')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tmp/uploads/profileImgs',
      }),
    }),
  )
  @ApiOperation({ summary: 'Cargar foto de perfil' })
  async addProfileImg(
    @GetReqUser('id') reqUserId,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.usersService.findOneById(reqUserId);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.usersService.uploadProfileImg(reqUserId, file);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.usersService.update(user, payload);
  }

  @Patch(':id/desactivate')
  async desactivate(@Param('id') userId: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.usersService.desactivate(userId, true);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }
}
