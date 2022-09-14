import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Delete,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  CreateShiftDto,
  FilterShiftsDto,
  UpdateShiftDto,
} from '../dtos/shift.dto';
import { ShiftsService } from '../services/shifts.service';

@ApiTags('shifts')
@Controller('shifts')
export class ShiftsController {
  constructor(private shiftService: ShiftsService) {}

  @Get()
  getShifts(@Query() params: FilterShiftsDto) {
    return this.shiftService.findAll(params);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.shiftService.findOne(id);
  }

  @Post()
  create(@Body() payload: CreateShiftDto) {
    return this.shiftService.create(payload);
  }

  @Put(':id')
  update(@Param('íd') id: number, @Body() payload: UpdateShiftDto) {
    return this.shiftService.update(id, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.shiftService.remove(id);
  }
}
