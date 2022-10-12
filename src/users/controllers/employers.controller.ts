import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateEmployerDto, UpdateEmployerDto } from '../dtos/employers.dto';
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

  @Put(':id')
  async update(@Param('id') id: number, @Body() payload: UpdateEmployerDto) {
    return await this.employersService.update(id, payload);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.employersService.remove(id);
  }
}
