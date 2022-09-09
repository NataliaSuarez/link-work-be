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
  findAll() {
    return this.workersService.findAll();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.workersService.findOne(id);
  }

  @Post()
  create(@Body() payload: CreateWorkerDto) {
    return this.workersService.create(payload);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() payload: UpdateWorkerDto) {
    return this.workersService.update(id, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.workersService.remove(id);
  }
}
