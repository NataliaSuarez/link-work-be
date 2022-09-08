import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { Users } from './entities/users.entity';

import { EmployersController } from './controllers/employers.controller';
import { EmployersService } from './services/employers.service';
import { Employer } from './entities/employer.entity';

import { WorkersController } from './controllers/workers.controller';
import { WorkersService } from './services/workers.service';
import { Worker } from './entities/worker.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Worker, Employer])],
  controllers: [UsersController, EmployersController, WorkersController],
  providers: [UsersService, EmployersService, WorkersService],
})
export class UsersModule {}
