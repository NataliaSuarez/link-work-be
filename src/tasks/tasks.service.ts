import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from 'src/users/services/users.service';

import { ShiftsService } from '../offers_and_shifts/services/shifts.service';

@Injectable()
export class TasksService {
  constructor(
    private shiftService: ShiftsService,
    private usersService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_9AM_AND_6PM)
  async handleCron() {
    await this.shiftService.autoConfirmShifts();
  }

  // Delete any user accounts that have been deactivated for more than 6 months
  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async deleteAllDeactivatedUsers() {
    const timeSinceDeactivation = new Date();
    timeSinceDeactivation.setUTCMonth(timeSinceDeactivation.getUTCMonth() - 6);
    await this.usersService.deleteAllDeactivatedUsers(timeSinceDeactivation);
  }
}
