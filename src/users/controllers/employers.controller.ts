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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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

@Controller('employers')
@ApiTags('employers')
@UseGuards(AccessTokenGuard)
export class EmployersController {
  constructor(private employersService: EmployersService) {}

  @Get('stripe-customer-data')
  async getStripeData(@GetReqUser('id') reqUserId) {
    return await this.employersService.retrieveStripeData(reqUserId);
  }

  @Post()
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
  async addBusinessImg(
    @GetReqUser('id') reqUserId,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.employersService.uploadBusinessImg(reqUserId, file);
  }

  @Post('add-address')
  async addAddress(
    @GetReqUser('id') reqUserId,
    @Body() payload: CreateAddressDto,
  ) {
    return await this.employersService.addAddress(reqUserId, payload);
  }

  @Delete('delete-address/:addressId')
  async deleteAddress(@Param('addressId') addressId: string) {
    return await this.employersService.deleteAddress(addressId);
  }

  @Put(':toUserId/add-review')
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
  async update(
    @GetReqUser('id') reqUserId,
    @Body() payload: UpdateEmployerDto,
  ) {
    const employerData = await this.employersService.findByUserId(reqUserId);
    if (!employerData) {
      throw new NotFoundException('User employer data not found');
    }
    return await this.employersService.update(employerData, payload);
  }
}
