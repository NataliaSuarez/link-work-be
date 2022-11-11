import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateShiftDto, UpdateShiftDto } from '../dtos/shift.dto';
import { ShiftsService } from '../services/shifts.service';
import { AccessTokenGuard } from '../../auth/jwt/accessToken.guard';
import { GetReqUser } from 'src/auth/get-req-user.decorator';
import { CheckAbilities } from 'src/auth/abilities/abilities.decorator';
import { Action } from 'src/auth/abilities/ability.factory';
import { Shift } from '../entities/shift.entity';
import { Role } from 'src/users/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
@UseGuards(AccessTokenGuard)
@ApiTags('shifts')
@Controller('shifts')
export class ShiftsController {
  constructor(private shiftService: ShiftsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener los shifts del usuario' })
  async getShifts(@GetReqUser() reqUser, @Query() pagination?: PaginationDto) {
    if (reqUser.role === Role.EMPLOYER) {
      return await this.shiftService.findByEmployerUserId(
        reqUser.id,
        pagination,
      );
    }
    if (reqUser.role === Role.WORKER) {
      return await this.shiftService.findByWorkerUserId(reqUser.id, pagination);
    }
  }

  @Get(':id')
  @CheckAbilities({ action: Action.Read, subject: Shift })
  async get(@Param('id') shiftId: string, @GetReqUser('id') reqUserId) {
    const shift = await this.shiftService.findOneById(shiftId, {
      workerUser: true,
      offer: true,
    });
    if (
      !shift ||
      (shift.workerUser.id !== reqUserId &&
        shift.offer.employerUser.id !== reqUserId)
    ) {
      throw new NotFoundException('Shift not found');
    }
    return shift;
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Obtener los shifts del usuario por status' })
  @CheckAbilities({ action: Action.Read, subject: Shift })
  async getByStatus(
    @Param('status') status: number,
    @GetReqUser('id') reqUserId,
  ) {
    return await this.shiftService.findByStatus(reqUserId, status);
  }

  @Post()
  @CheckAbilities({ action: Action.Create, subject: Shift })
  async create(
    @Body() payload: CreateShiftDto,
    @GetReqUser('id') reqEmployerUserId,
  ) {
    return await this.shiftService.create(payload, reqEmployerUserId);
  }

  @Post('clock-in/:shiftId')
  @CheckAbilities({ action: Action.Read, subject: Shift })
  async clockIn(@Param('shiftId') shiftId: string, @GetReqUser() reqUser) {
    const shift = await this.shiftService.findOneById(shiftId, {
      workerUser: true,
      offer: true,
    });
    if (
      !shift ||
      (shift.workerUser.id !== reqUser.id &&
        shift.offer.employerUser.id !== reqUser.id)
    ) {
      throw new NotFoundException('Shift not found');
    }
    if (reqUser.role === Role.EMPLOYER) {
      return await this.shiftService.clockInByEmployer(shift);
    }
    if (reqUser.role === Role.WORKER) {
      return await this.shiftService.clockInByWorker(shift);
    }
  }

  @Post('clock-out/:shiftId')
  @CheckAbilities({ action: Action.Read, subject: Shift })
  async clockOut(@Param('shiftId') shiftId: string, @GetReqUser() reqUser) {
    const shift = await this.shiftService.findOneById(shiftId, {
      workerUser: true,
      offer: true,
    });
    if (
      !shift ||
      (shift.workerUser.id !== reqUser.id &&
        shift.offer.employerUser.id !== reqUser.id)
    ) {
      throw new NotFoundException('Shift not found');
    }
    if (reqUser.role === Role.EMPLOYER) {
      return await this.shiftService.confirmShift(shift);
    }
    if (reqUser.role === Role.WORKER) {
      return await this.shiftService.clockOutByWorker(shift);
    }
  }
}
