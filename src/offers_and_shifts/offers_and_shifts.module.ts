import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Offer } from './entities/offer.entity';
import { OffersService } from './services/offers.service';
import { OffersController } from './controllers/offers.controller';

import { Shift } from './entities/shift.entity';
import { ShiftsService } from './services/shifts.service';
import { ShiftsController } from './controllers/shifts.controller';

import { WorkerData } from '../users/entities/worker_data.entity';
import { EmployerData } from '../users/entities/employer_data.entity';
import { EmployersService } from '../users/services/employers.service';
import { UsersService } from '../users/services/users.service';
import { User } from '../users/entities/user.entity';
import { StripeService } from '../stripe/stripe.service';
import { Clock } from './entities/clock.entity';
import { DOSpacesService } from '../spaces/services/doSpacesService';
import { DOSpacesServiceProvider } from '../spaces/services';
import { UserImage } from '../users/entities/user_image.entity';
import { Address } from '../users/entities/address.entity';
import { WorkersService } from '../users/services/workers.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      Shift,
      Clock,
      WorkerData,
      EmployerData,
      User,
      UserImage,
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
    WorkersService,
    ConfigService,
  ],
  exports: [OffersService, ShiftsService],
})
export class OffersAndShiftsModule {}
