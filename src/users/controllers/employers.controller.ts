import {
  Body,
  Controller,
  Post,
  Param,
  Put,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  NotFoundException,
  Delete,
  Get,
  BadRequestException,
  ForbiddenException,
  UploadedFiles,
  UseFilters,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import {
  CreateEmployerDto,
  UpdateEmployerDto,
  UpdateStarsDto,
} from '../dtos/employers.dto';
import { EmployersService } from '../services/employers.service';
import { CreateAddressDto } from '../dtos/users.dto';
import { GetReqUser } from 'src/auth/get-req-user.decorator';
import { AccessTokenGuard } from 'src/auth/jwt/accessToken.guard';
import { EmailConfirmationGuard } from '../../auth/mail/emailConfirmation.guard';
import { UsersService } from '../services/users.service';
import { FileExtender } from '../../utils/interceptors/file.extender';
import { AllExceptionsFilter } from '../../utils/filters/all-exceptions.filter';

@UseFilters(AllExceptionsFilter)
@Controller('employers')
@ApiTags('employers')
@ApiBearerAuth()
@UseGuards(EmailConfirmationGuard)
@UseGuards(AccessTokenGuard)
export class EmployersController {
  constructor(
    private employersService: EmployersService,
    private usersService: UsersService,
  ) {}

  @Get('stripe-customer-data')
  @ApiOperation({ summary: 'Obtener data del usuario en Stripe' })
  async getStripeData(@GetReqUser('id') reqUserId) {
    return await this.employersService.retrieveStripeData(reqUserId);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        payload: { type: 'CreateEmployerDto' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileExtender)
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './tmp/uploads/employerImgs',
      }),
    }),
  )
  @ApiOperation({ summary: 'Crear perfil con datos de empleador' })
  async create(
    @GetReqUser('id') reqUserId,
    @Body() data: CreateEmployerDto,
    @UploadedFiles()
    file: Express.Multer.File[],
  ) {
    if (file) {
      await this.employersService.uploadEmployerFiles(reqUserId, file);
    }
    return await this.employersService.createEmployerData(data, reqUserId);
  }

  @Post('upload-img')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tmp/uploads/employerImgs',
      }),
    }),
  )
  @ApiOperation({ summary: 'Subir imagen del local' })
  async addBusinessImg(
    @GetReqUser('id') reqUserId,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.employersService.uploadBusinessImg(reqUserId, file);
  }

  @Post('add-address')
  @ApiOperation({ summary: 'Agregar dirección alternativa' })
  async addAddress(
    @GetReqUser('id') reqUserId,
    @Body() payload: CreateAddressDto,
  ) {
    return await this.employersService.addAddress(reqUserId, payload);
  }

  @Delete('delete-address/:addressId')
  @ApiOperation({ summary: 'Eliminar dirección alternativa' })
  async deleteAddress(@Param('addressId') addressId: string) {
    return await this.employersService.deleteAddress(addressId);
  }

  @Put(':toUserId/add-review')
  @ApiOperation({ summary: 'Puntuar con estrellas a un empleador' })
  async addReview(
    @Param('toUserId') employerUserId: string,
    @GetReqUser('id') reqUserId,
    @Body() payload: UpdateStarsDto,
  ) {
    if (reqUserId === employerUserId) {
      throw new BadRequestException('Can not review yourself');
    }
    const employerData = await this.employersService.findByUserId(
      employerUserId,
    );
    return await this.employersService.updateStars(employerData, payload.stars);
  }

  @Put()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        payload: { type: 'UpdateEmployerDto' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileExtender)
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './tmp/uploads/employerImgs',
      }),
    }),
  )
  @ApiOperation({ summary: 'Actualizar datos de empleador' })
  async update(
    @GetReqUser('id') reqUserId,
    @Body() data: UpdateEmployerDto,
    @UploadedFiles()
    file: Express.Multer.File[],
  ) {
    const employerData = await this.employersService.findByUserId(reqUserId);
    if (!employerData) {
      throw new NotFoundException('User employer data not found');
    }
    if (data.customerId) {
      throw new ForbiddenException("Can't update stripe id");
    }
    if (file) {
      await this.employersService.uploadEmployerFiles(reqUserId, file);
    }
    return await this.employersService.update(employerData, data);
  }
}
