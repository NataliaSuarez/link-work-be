import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateShiftDto } from '../dtos/shift.dto';
import { ShiftsService } from '../services/shifts.service';
import { AccessTokenGuard } from '../../auth/jwt/accessToken.guard';
import { GetReqUser } from '../../auth/get-req-user.decorator';
import { CheckAbilities } from '../../auth/abilities/abilities.decorator';
import { Action } from '../../auth/abilities/ability.factory';
import { Shift } from '../entities/shift.entity';
import { Role } from '../../users/entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EmailConfirmationGuard } from '../../auth/mail/emailConfirmation.guard';

@ApiBearerAuth()
@UseGuards(EmailConfirmationGuard)
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
  @ApiOperation({
    summary:
      'Obtener shift por su ID solo si pertenece al usuario que lo consulta',
  })
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
  @ApiOperation({ summary: 'Crear shift al seleccionar aplicante' })
  async create(
    @Body() payload: CreateShiftDto,
    @GetReqUser('id') reqEmployerUserId,
  ) {
    return await this.shiftService.create(payload, reqEmployerUserId);
  }

  @Post('clock-in/:shiftId')
  @CheckAbilities({ action: Action.Read, subject: Shift })
  @ApiOperation({ summary: 'Realizar clock-in' })
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
  @ApiOperation({ summary: 'Realizar clock-out' })
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
