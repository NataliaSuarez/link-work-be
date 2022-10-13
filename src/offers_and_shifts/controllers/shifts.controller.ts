import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Delete,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import {
  CreateShiftDto,
  FilterShiftsDto,
  UpdateShiftDto,
} from '../dtos/shift.dto';
import { ShiftsService } from '../services/shifts.service';
import { AccessTokenGuard } from '../../common/guards/accessToken.guard';
@UseGuards(AccessTokenGuard)
@ApiTags('shifts')
@Controller('shifts')
export class ShiftsController {
  constructor(private shiftService: ShiftsService) {}

  @Get()
  getShifts(@Req() req: Request) {
    return this.shiftService.findShifts(req.user);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.shiftService.findOneById(id);
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
