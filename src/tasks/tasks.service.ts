import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ShiftsService } from '../offers/services/shifts.service';

@Injectable()
export class TasksService {
  constructor(private shiftService: ShiftsService) {}

  @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_9AM_AND_6PM)
  async handleCron() {
    await this.shiftService.autoConfirmShifts();
  }
}
