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
import { GetReqUser } from 'src/auth/get-req-user.decorator';
import { AccessTokenGuard } from 'src/auth/jwt/accessToken.guard';

@Controller('employers')
@ApiTags('employers')
@UseGuards(AccessTokenGuard)
export class EmployersController {
  constructor(private employersService: EmployersService) {}

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

  @Put(':id/add-review')
  async addReview(
    @Param('id') employerUserId: string,
    @Body() payload: UpdateStarsDto,
  ) {
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
