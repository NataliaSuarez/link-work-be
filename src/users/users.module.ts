import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';

import { EmployersController } from './controllers/employers.controller';
import { EmployersService } from './services/employers.service';
import { Employer } from './entities/employer.entity';

import { WorkersController } from './controllers/workers.controller';
import { WorkersService } from './services/workers.service';
import { Worker } from './entities/worker.entity';

import { Offer } from 'src/offers_and_shifts/entities/offer.entity';
import { Shift } from 'src/offers_and_shifts/entities/shift.entity';

import { Experience } from './entities/experience.entity';
import { StripeService } from '../stripe/stripe.service';
import { Clock } from '../offers_and_shifts/entities/clock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Worker,
      Employer,
      Offer,
      Shift,
      Clock,
      Experience,
    ]),
  ],
  controllers: [UsersController, EmployersController, WorkersController],
  providers: [UsersService, EmployersService, WorkersService, StripeService],
  exports: [UsersService, EmployersService, WorkersService],
})
export class UsersModule {}
