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

import { CreateShiftDto, UpdateShiftDto } from '../dtos/shift.dto';
import { ShiftsService } from '../services/shifts.service';
import { AccessTokenGuard } from '../../common/guards/accessToken.guard';
import { UserIdDto } from '../../users/dtos/users.dto';
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

  @Get('by-status/:status')
  getByStatus(@Param('status') status: number, @Req() req: Request) {
    return this.shiftService.findByStatus(req.user, status);
  }

  @Post()
  create(@Body() payload: CreateShiftDto) {
    return this.shiftService.create(payload);
  }

  @Post('/clock-in/:shiftId')
  clockIn(@Param('shiftId') shiftId: number, @Body() userId: UserIdDto) {
    return this.shiftService.clockIn(shiftId, userId.userId);
  }

  @Post('/clock-out/:shiftId')
  clockOut(@Param('shiftId') shiftId: number, @Body() userId: UserIdDto) {
    return this.shiftService.clockOut(shiftId, userId.userId);
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
