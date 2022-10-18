import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  ParseIntPipe,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import {
  CreateWorkerDto,
  StripeUserAccDto,
  UpdateWorkerDto,
} from '../dtos/workers.dto';
import { WorkersService } from '../services/workers.service';

@ApiTags('workers')
@Controller('workers')
export class WorkersController {
  constructor(private workersService: WorkersService) {}

  @Get()
  async findAll() {
    return await this.workersService.findAll();
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    return await this.workersService.findOne(id);
  }

  @Post()
  async create(@Body() payload: CreateWorkerDto) {
    return await this.workersService.create(payload);
  }

  @Post('create-stripe-account/:id')
  createStripeUserAccount(
    @Param('id') id: number,
    @Body() payload: StripeUserAccDto,
  ) {
    return this.workersService.createStripeAccount(id, payload);
  }

  @Post(':id/upload-video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tmp/uploads/workers',
      }),
    }),
  )
  async addExperienceVideo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.workersService.uploadExperienceVideo(id, file);
  }

  @Get(':id/video')
  async downloadFileUrl(@Param('id') workerId: number) {
    return this.workersService.getDownloadFileUrl(workerId);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() payload: UpdateWorkerDto) {
    return await this.workersService.update(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.workersService.remove(id);
  }
}
