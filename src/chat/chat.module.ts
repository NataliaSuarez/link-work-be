import { Module } from '@nestjs/common';
import { TypegooseModule } from '@m8a/nestjs-typegoose';

import { Chat } from './chat.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { UsersModule } from '../users/users.module';
import { RoomService } from './room.service';
import { Room } from './room.entity';
import { ShiftsService } from '../offers_and_shifts/services/shifts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from '../offers_and_shifts/entities/shift.entity';
import { Clock } from '../offers_and_shifts/entities/clock.entity';
import { User } from '../users/entities/user.entity';
import { UserImage } from '../users/entities/user_image.entity';
import { Offer } from '../offers_and_shifts/entities/offer.entity';
import { OffersService } from '../offers_and_shifts/services/offers.service';
import { StripeService } from '../stripe/stripe.service';
import { Address } from '../users/entities/address.entity';
import { EmployerData } from '../users/entities/employer_data.entity';
import { WorkerData } from '../users/entities/worker_data.entity';
import { EmployersService } from '../users/services/employers.service';
import { WorkersService } from '../users/services/workers.service';
import { DOSpacesService } from '../spaces/services/doSpacesService';
import { DOSpacesServiceProvider } from '../spaces/services';

@Module({
  imports: [
    TypegooseModule.forFeature([Chat, Room]),
    UsersModule,
    TypeOrmModule.forFeature([
      Shift,
      Clock,
      User,
      UserImage,
      Offer,
      Address,
      EmployerData,
      WorkerData,
    ]),
  ],
  providers: [
    ChatGateway,
    ChatService,
    RoomService,
    ShiftsService,
    OffersService,
    StripeService,
    EmployersService,
    WorkersService,
    DOSpacesService,
    DOSpacesServiceProvider,
  ],
})
export class ChatModule {}
