import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
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

@ApiTags('employers')
@Controller('employers')
export class EmployersController {
  constructor(private employersService: EmployersService) {}

  @Get()
  async findAll() {
    return await this.employersService.findAll();
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return await this.employersService.findOne(id);
  }

  @Post()
  async create(@Body() payload: CreateEmployerDto) {
    return await this.employersService.create(payload);
  }

  @Post(':id/upload-img')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tmp/uploads/employerImgs',
      }),
    }),
  )
  async addBusinessImg(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.employersService.uploadBusinessImg(id, file);
  }

  @Put(':id/add-review')
  async addReview(@Param('id') id: number, @Body() payload: UpdateStarsDto) {
    return await this.employersService.updateStars(id, payload.stars);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() payload: UpdateEmployerDto) {
    return await this.employersService.update(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.employersService.remove(id);
  }
}
