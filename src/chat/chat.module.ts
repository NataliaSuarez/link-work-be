import { Module } from '@nestjs/common';
import { TypegooseModule } from '@m8a/nestjs-typegoose';

import { Chat } from './chat.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { UsersModule } from '../users/users.module';
import { RoomService } from './room.service';
import { Room } from './room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shift } from '../offers_and_shifts/entities/shift.entity';
import { Clock } from '../offers_and_shifts/entities/clock.entity';
import { User } from '../users/entities/user.entity';
import { UserImage } from '../users/entities/user_image.entity';
import { Offer } from '../offers_and_shifts/entities/offer.entity';
import { Address } from '../users/entities/address.entity';
import { EmployerData } from '../users/entities/employer_data.entity';
import { WorkerData } from '../users/entities/worker_data.entity';
import { OffersAndShiftsModule } from '../offers_and_shifts/offers_and_shifts.module';

@Module({
  imports: [
    TypegooseModule.forFeature([Chat, Room]),
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
    UsersModule,
    OffersAndShiftsModule,
  ],
  providers: [ChatGateway, ChatService, RoomService],
})
export class ChatModule {}
