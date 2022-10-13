import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './config/typeorm.module';
import { TypegooseModule } from '@m8a/nestjs-typegoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { OffersAndShiftsModule } from './offers_and_shifts/offers_and_shifts.module';
import { AuthModule } from './auth/auth.module';
import { StripeModule } from './stripe/stripe.module';
import { ChatModule } from './chat/chat.module';
import { Chat } from './chat/chat.entity';
import { TasksModule } from './tasks/tasks.module';
import config from './config';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    UsersModule,
    OffersAndShiftsModule,
    AuthModule,
    StripeModule,
    TypegooseModule.forRoot(process.env.MONGO_URI),
    TypegooseModule.forFeature([Chat]),
    ChatModule,
    ScheduleModule.forRoot(),
    TasksModule,
  ],
  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}
