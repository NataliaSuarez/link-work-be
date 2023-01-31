import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { EmployerData } from '../users/entities/employer_data.entity';
import { WorkerData } from '../users/entities/worker_data.entity';
import { Offer } from '../offers_and_shifts/entities/offer.entity';
import { Shift } from '../offers_and_shifts/entities/shift.entity';
import { TasksService } from './tasks.service';
import { Clock } from '../offers_and_shifts/entities/clock.entity';
import { UserImage } from '../users/entities/user_image.entity';
import { Address } from '../users/entities/address.entity';
import { OffersAndShiftsModule } from '../offers_and_shifts/offers_and_shifts.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shift,
      Offer,
      WorkerData,
      EmployerData,
      User,
      Clock,
      UserImage,
      Address,
    ]),
    UsersModule,
    OffersAndShiftsModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
