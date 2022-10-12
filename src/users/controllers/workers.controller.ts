import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  ParseIntPipe,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateWorkerDto, UpdateWorkerDto } from '../dtos/workers.dto';
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

  @Put(':id')
  async update(@Param('id') id: number, @Body() payload: UpdateWorkerDto) {
    return await this.workersService.update(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.workersService.remove(id);
  }
}
