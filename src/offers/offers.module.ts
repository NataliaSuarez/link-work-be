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

@Module({
  imports: [TypeOrmModule.forFeature([Offers, Shift, Worker, Employer])],
  controllers: [OffersController, ShiftsController],
  providers: [OffersService, ShiftsService],
  exports: [OffersService, ShiftsService, TypeOrmModule],
})
export class OffersModule {}
