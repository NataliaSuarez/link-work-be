import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Offers } from './entities/offers.entity';
import { OffersService } from './services/offers.service';
import { OffersController } from './controllers/offers.controller';

import { Shift } from './entities/shift.entity';
import { ShiftsService } from './services/shifts.service';
import { ShiftsController } from './controllers/shifts.controller';

import { Worker } from '../users/entities/worker.entity';
import { Employer } from '../users/entities/employer.entity';
import { EmployersService } from '../users/services/employers.service';
import { UsersService } from '../users/services/users.service';
import { Users } from '../users/entities/users.entity';
import { StripeService } from '../stripe/stripe.service';
import { Clocks } from './entities/clocks.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offers, Shift, Clocks, Worker, Employer, Users]),
  ],
  controllers: [OffersController, ShiftsController],
  providers: [
    OffersService,
    ShiftsService,
    UsersService,
    EmployersService,
    StripeService,
  ],
  exports: [OffersService, ShiftsService],
})
export class OffersAndShiftsModule {}
