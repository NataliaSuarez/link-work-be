import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { OffersAndShiftsModule } from './offers_and_shifts/offers_and_shifts.module';
import { AuthModule } from './auth/auth.module';
import { StripeModule } from './stripe/stripe.module';
import { ChatModule } from './chat/chat.module';
import { Chat } from './chat/chat.entity';
import { TasksModule } from './tasks/tasks.module';
import { SpacesModule } from './spaces/spaces.module';
import config from './config';
import { configValidationSchema } from './config.schema';
import { AbilityModule } from './auth/abilities/ability.module';
import { LoggerService } from './loggerService/logger.service';
import { SendgridService } from './sendgrid/sendgrid.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { SupportModule } from './support/support.module';
import { NotifyModule } from './notify/notify.module';
import { Room } from './chat/room.entity';
import { RedirectionsModule } from './redirections/redirections.module';
import { typeOrmAsyncConfig } from './config/typeorm.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    AbilityModule,
    UsersModule,
    OffersAndShiftsModule,
    AuthModule,
    StripeModule,
    TypegooseModule.forRoot(process.env.MONGO_URI),
    TypegooseModule.forFeature([Chat, Room]),
    ChatModule,
    ScheduleModule.forRoot(),
    TasksModule,
    SpacesModule,
    NestjsFormDataModule,
    SupportModule,
    NotifyModule,
    RedirectionsModule,
    NotifyModule,
    RedirectionsModule,
    NotifyModule,
  ],
  controllers: [AppController],

  providers: [AppService, LoggerService, SendgridService],
})
export class AppModule {}
