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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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

@Controller('employers')
@ApiTags('employers')
@ApiBearerAuth()
@UseGuards(EmailConfirmationGuard)
@UseGuards(AccessTokenGuard)
export class EmployersController {
  constructor(private employersService: EmployersService) {}

  @Get('stripe-customer-data')
  @ApiOperation({ summary: 'Obtener data del usuario en Stripe' })
  async getStripeData(@GetReqUser('id') reqUserId) {
    return await this.employersService.retrieveStripeData(reqUserId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear perfil con datos de empleador' })
  async create(
    @Body() payload: CreateEmployerDto,
    @GetReqUser('id') reqUserId,
  ) {
    return await this.employersService.createEmployerData(payload, reqUserId);
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
  @ApiOperation({ summary: 'Actualizar datos de empleador' })
  async update(
    @GetReqUser('id') reqUserId,
    @Body() payload: UpdateEmployerDto,
  ) {
    const employerData = await this.employersService.findByUserId(reqUserId);
    if (!employerData) {
      throw new NotFoundException('User employer data not found');
    }
    if (payload.customerId) {
      throw new ForbiddenException("Can't update stripe id");
    }
    return await this.employersService.update(employerData, payload);
  }
}
