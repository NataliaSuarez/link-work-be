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
import { DOSpacesService } from '../spaces/services/doSpacesService';
import { DOSpacesServiceProvider } from '../spaces/services';
import { Experience } from '../users/entities/experience.entity';
import { BusinessImages } from '../users/entities/businessImg.entity';
import { Address } from '../users/entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shift,
      Offer,
      Worker,
      Employer,
      User,
      Clock,
      Experience,
      BusinessImages,
      Address,
    ]),
  ],
  providers: [
    TasksService,
    ShiftsService,
    OffersService,
    StripeService,
    EmployersService,
    WorkersService,
    UsersService,
    DOSpacesService,
    DOSpacesServiceProvider,
  ],
})
export class TasksModule {}
