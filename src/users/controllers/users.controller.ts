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
  UseFilters,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { FilterUsersDto, UpdateUserDto } from '../dtos/users.dto';
import { UsersService } from '../services/users.service';
import { AccessTokenGuard } from '../../auth/jwt/accessToken.guard';
import { GetReqUser } from '../../auth/get-req-user.decorator';
import { Role, User } from '../entities/user.entity';
import { AllExceptionsFilter } from '../../utils/filters/all-exceptions.filter';
import { AuthService } from 'src/auth/auth.service';

@UseFilters(AllExceptionsFilter)
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Filtro y paginación de usuarios' })
  async getUsers(@Query() params: FilterUsersDto) {
    return await this.usersService.findAllFiltered(params);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiOkResponse({ type: User })
  async get(@Param('id') id: string) {
    const user = await this.usersService.findOneById(id, {
      userImages: true,
      workerData: true,
      employerData: true,
    });
    if (user.role === Role.EMPLOYER) {
      const { workerData, ...userClean } = user;
      return userClean;
    } else if (user.role === Role.WORKER) {
      const { employerData, ...userClean } = user;
      return userClean;
    }
  }

  @Get('apple-id/:id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiOkResponse({ type: User })
  async getByAppleIdIdentifier(@Param('id') id: string) {
    const user = await this.usersService.findOneByAppleIdIdentifier(id, {
      userImages: true,
      workerData: true,
      employerData: true,
    });

    if (user) {
      const tokens = await this.authService.getTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      await this.authService.updateRefreshToken(user.id, tokens.refreshToken);

      let userResult: any;

      if (user.role === Role.EMPLOYER) {
        const { workerData, ...userClean } = user;
        userResult = userClean;
      } else if (user.role === Role.WORKER) {
        const { employerData, ...userClean } = user;
        userResult = userClean;
      }

      return { tokens: tokens, user: userResult };
    } else {
      throw new NotFoundException(
        `User not found, please contact the support team.`,
      );
    }
  }

  @Post('upload-profile-img')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
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
    return await this.usersService.uploadUserImg(reqUserId, file);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Actualizar usuario' })
  async update(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.usersService.update(user, payload);
  }

  @Patch(':id/desactivate')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Desactivar un usuario' })
  async desactivate(@Param('id') userId: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return await this.usersService.desactivate(userId, true);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Eliminar usuario' })
  async delete(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }
}
