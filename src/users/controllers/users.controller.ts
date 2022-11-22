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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { FilterUsersDto, UpdateUserDto } from '../dtos/users.dto';
import { UsersService } from '../services/users.service';
import { AccessTokenGuard } from 'src/auth/jwt/accessToken.guard';
import { GetReqUser } from 'src/auth/get-req-user.decorator';
import { Role } from '../entities/user.entity';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
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
    const user = await this.usersService.findOneById(id, {
      employerBusinessImages: true,
      workerExperience: true,
    });
    if (user.role === Role.EMPLOYER) {
      const { workerExperience, workerData, ...userClean } = user;
      return userClean;
    } else if (user.role === Role.WORKER) {
      const { employerBusinessImages, employerData, ...userClean } = user;
      return userClean;
    }
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
  @ApiOperation({ summary: 'Actualizar usuario' })
  async update(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.usersService.update(user, payload);
  }

  @Patch(':id/desactivate')
  @ApiOperation({ summary: 'Desactivar un usuario' })
  async desactivate(@Param('id') userId: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.usersService.desactivate(userId, true);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  async delete(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }
}
