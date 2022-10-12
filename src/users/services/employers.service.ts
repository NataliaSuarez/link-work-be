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
import { StripeService } from '../../stripe/stripe.service';

@Injectable()
export class EmployersService {
  constructor(
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    private usersService: UsersService,
    private stripeService: StripeService,
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
    const { number, exp_month, exp_year, cvc } = data;
    const user = await this.usersService.findOneById(data.userId);
    if (!user) {
      throw new NotFoundException(`User #${data.userId} not found`);
    }
    const fullName = user.firstName + ' ' + user.lastName;
    const customerData = {
      email: user.email,
      name: fullName,
      description: data.businessName,
    };
    const customer = await this.stripeService.createCustomer(customerData);
    const card = {
      number: number,
      exp_month: exp_month,
      exp_year: exp_year,
      cvc: cvc,
    };
    const paymentMethod = await this.stripeService.createPaymentMethod(
      customer.id,
      card,
    );
    const employer = {
      address: data.address,
      city: data.city,
      state: data.state,
      businessCode: data.businessCode,
      businessName: data.businessName,
      description: data.description,
      stars: 0,
      totalReviews: 0,
      customerId: customer.id,
    };
    const newEmployer = this.employerRepository.create(employer);
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
