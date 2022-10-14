import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { Employer } from '../users/entities/employer.entity';
import { Worker } from '../users/entities/worker.entity';
import { Offer } from '../offers_and_shifts/entities/offer.entity';
import { Shift } from '../offers_and_shifts/entities/shift.entity';
import { ShiftsService } from '../offers_and_shifts/services/shifts.service';
import { TasksService } from './tasks.service';
import { OffersService } from '../offers_and_shifts/services/offers.service';
import { StripeService } from '../stripe/stripe.service';
import { EmployersService } from '../users/services/employers.service';
import { WorkersService } from '../users/services/workers.service';
import { UsersService } from '../users/services/users.service';
import { Clock } from '../offers_and_shifts/entities/clock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shift, Offer, Worker, Employer, User, Clock]),
  ],
  providers: [
    TasksService,
    ShiftsService,
    OffersService,
    StripeService,
    EmployersService,
    WorkersService,
    UsersService,
  ],
})
export class TasksModule {}
