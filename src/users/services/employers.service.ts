import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateEmployerDto } from '../dtos/employers.dto';
import { Employer } from '../entities/employer.entity';
import { UsersService } from './users.service';

@Injectable()
export class EmployersService {
  constructor(
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    private usersService: UsersService,
  ) {}

  async create(data: CreateEmployerDto) {
    const newEmployer = this.employerRepository.create(data);
    const user = await this.usersService.findOne(data.userId);
    newEmployer.user = user;
    return this.employerRepository.save(newEmployer);
  }

  findAll() {
    return this.employerRepository.find();
  }
}
