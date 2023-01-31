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
import { User } from '../users/entities/user.entity';
import { StripeService } from '../stripe/stripe.service';
import { Clock } from './entities/clock.entity';
import { DOSpacesService } from '../spaces/services/doSpacesService';
import { DOSpacesServiceProvider } from '../spaces/services';
import { UserImage } from '../users/entities/user_image.entity';
import { Address } from '../users/entities/address.entity';
import { SendgridService } from '../sendgrid/sendgrid.service';
import { UsersModule } from '../users/users.module';
import { NotifyModule } from '../notify/notify.module';

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
    UsersModule,
    NotifyModule,
  ],
  controllers: [OffersController, ShiftsController],
  providers: [
    OffersService,
    ShiftsService,
    StripeService,
    DOSpacesService,
    DOSpacesServiceProvider,
    SendgridService,
  ],
  exports: [OffersService, ShiftsService],
})
export class OffersAndShiftsModule {}
