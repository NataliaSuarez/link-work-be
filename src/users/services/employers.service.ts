import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import {
  CreateEmployerDto,
  FilterEmployersDto,
  UpdateEmployerDto,
} from '../dtos/employers.dto';
import { Employer } from '../entities/employer.entity';
import { UsersService } from './users.service';

@Injectable()
export class EmployersService {
  constructor(
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    private usersService: UsersService,
  ) {}

  findAll(params?: FilterEmployersDto) {
    if (params) {
      const where: FindOptionsWhere<Employer> = {};
      const { limit, offset } = params;
      return this.employerRepository.find({
        where,
        take: limit,
        skip: offset,
      });
    }
    return this.employerRepository.find();
  }

  async findOne(id: number): Promise<Employer> {
    const employer = await this.employerRepository.findOneBy({ id: id });
    if (!employer) {
      throw new NotFoundException(`Employer #${id} not found`);
    }
    return employer;
  }

  async create(data: CreateEmployerDto) {
    const newEmployer = this.employerRepository.create(data);
    const user = await this.usersService.findOne(data.userId);
    newEmployer.user = user;
    return this.employerRepository.save(newEmployer);
  }

  async update(id: number, changes: UpdateEmployerDto) {
    const employer = await this.employerRepository.findOneBy({ id: id });
    if (!employer) {
      throw new NotFoundException(`Employer #${id} not found`);
    }
    this.employerRepository.merge(employer, changes);
    return this.employerRepository.save(employer);
  }

  async remove(id: number) {
    const employer = await this.employerRepository.findOneBy({ id: id });
    if (!employer) {
      throw new NotFoundException(`Employer #${id} not found`);
    }
    return this.employerRepository.delete(id);
  }
}
