import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateWorkerDto } from '../dtos/workers.dto';
import { Worker } from '../entities/worker.entity';
import { UsersService } from './users.service';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(Worker) private workerRepository: Repository<Worker>,
    private usersService: UsersService,
  ) {}

  async create(data: CreateWorkerDto) {
    const newWorker = this.workerRepository.create(data);
    const user = await this.usersService.findOne(data.userId);
    newWorker.user = user;
    return this.workerRepository.save(newWorker);
  }

  findAll() {
    return this.workerRepository.find();
  }
}
