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
  findAll() {
    return this.employersService.findAll();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.employersService.findOne(id);
  }

  @Post()
  create(@Body() payload: CreateEmployerDto) {
    return this.employersService.create(payload);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() payload: UpdateEmployerDto) {
    return this.employersService.update(id, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.employersService.remove(id);
  }
}
