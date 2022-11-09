import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';

import { EmployersController } from './controllers/employers.controller';
import { EmployersService } from './services/employers.service';
import { EmployerData } from './entities/employer_data.entity';

import { WorkersController } from './controllers/workers.controller';
import { WorkersService } from './services/workers.service';
import { WorkerData } from './entities/worker_data.entity';

import { Offer } from 'src/offers_and_shifts/entities/offer.entity';
import { Shift } from 'src/offers_and_shifts/entities/shift.entity';

import { WorkerExperience } from './entities/worker_experience.entity';
import { StripeService } from '../stripe/stripe.service';
import { Clock } from '../offers_and_shifts/entities/clock.entity';
import { DOSpacesService } from '../spaces/services/doSpacesService';
import { DOSpacesServiceProvider } from '../spaces/services';
import { EmployerBusinessImage } from './entities/employer_business_image.entity';
import { ShiftsService } from '../offers_and_shifts/services/shifts.service';
import { OffersService } from '../offers_and_shifts/services/offers.service';
import { Address } from './entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      WorkerData,
      EmployerData,
      Offer,
      Shift,
      Clock,
      WorkerExperience,
      EmployerBusinessImage,
      Address,
    ]),
  ],
  controllers: [UsersController, EmployersController, WorkersController],
  providers: [
    UsersService,
    EmployersService,
    WorkersService,
    StripeService,
    DOSpacesService,
    DOSpacesServiceProvider,
    ShiftsService,
    OffersService,
  ],
  exports: [UsersService, EmployersService, WorkersService],
})
export class UsersModule {}
