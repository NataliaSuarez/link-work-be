import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import {
  CreateWorkerDto,
  FilterWorkersDto,
  UpdateWorkerDto,
} from '../dtos/workers.dto';
import { Worker } from '../entities/worker.entity';
import { UsersService } from './users.service';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(Worker)
    private workerRepository: Repository<Worker>,
    private usersService: UsersService,
  ) {}

  findAll(params?: FilterWorkersDto) {
    if (params) {
      const where: FindOptionsWhere<Worker> = {};
      const { limit, offset } = params;
      return this.workerRepository.find({
        where,
        take: limit,
        skip: offset,
      });
    }
    return this.workerRepository.find();
  }

  async findOne(id: number): Promise<Worker> {
    const worker = await this.workerRepository.findOneBy({ id: id });
    if (!worker) {
      throw new NotFoundException(`Worker #${id} not found`);
    }
    return worker;
  }

  async create(data: CreateWorkerDto) {
    const newWorker = this.workerRepository.create(data);
    const user = await this.usersService.findOne(data.userId);
    newWorker.user = user;
    return this.workerRepository.save(newWorker);
  }

  async update(id: number, changes: UpdateWorkerDto) {
    const worker = await this.workerRepository.findOneBy({ id: id });
    if (!worker) {
      throw new NotFoundException(`Worker #${id} not found`);
    }
    this.workerRepository.merge(worker, changes);
    return this.workerRepository.save(worker);
  }

  async remove(id: number) {
    const worker = await this.workerRepository.findOneBy({ id: id });
    if (!worker) {
      throw new NotFoundException(`Worker #${id} not found`);
    }
    return this.workerRepository.delete(id);
  }
}
