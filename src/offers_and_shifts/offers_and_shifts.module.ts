import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Offer } from './entities/offer.entity';
import { OffersService } from './services/offers.service';
import { OffersController } from './controllers/offers.controller';

import { Shift } from './entities/shift.entity';
import { ShiftsService } from './services/shifts.service';
import { ShiftsController } from './controllers/shifts.controller';

import { Worker } from '../users/entities/worker.entity';
import { Employer } from '../users/entities/employer.entity';
import { EmployersService } from '../users/services/employers.service';
import { UsersService } from '../users/services/users.service';
import { User } from '../users/entities/user.entity';
import { StripeService } from '../stripe/stripe.service';
import { Clock } from './entities/clock.entity';
import { DOSpacesService } from '../spaces/services/doSpacesService';
import { DOSpacesServiceProvider } from '../spaces/services';
import { BusinessImages } from '../users/entities/businessImg.entity';
import { Address } from '../users/entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      Shift,
      Clock,
      Worker,
      Employer,
      User,
      BusinessImages,
      Address,
    ]),
  ],
  controllers: [OffersController, ShiftsController],
  providers: [
    OffersService,
    ShiftsService,
    UsersService,
    EmployersService,
    StripeService,
    DOSpacesService,
    DOSpacesServiceProvider,
  ],
  exports: [OffersService, ShiftsService],
})
export class OffersAndShiftsModule {}
