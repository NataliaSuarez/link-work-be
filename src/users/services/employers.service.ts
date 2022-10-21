import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
import { BusinessImages } from '../entities/businessImg.entity';
import { DOSpacesService } from '../../spaces/services/doSpacesService';
import { ShiftsService } from '../../offers_and_shifts/services/shifts.service';

@Injectable()
export class EmployersService {
  constructor(
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(BusinessImages)
    private imgRepository: Repository<BusinessImages>,
    private usersService: UsersService,
    private stripeService: StripeService,
    private doSpaceService: DOSpacesService,
    private shiftService: ShiftsService,
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
    try {
      const user = await this.usersService.findOneById(data.userId);
      if (!user) {
        throw new NotFoundException(`User #${data.userId} not found`);
      }
      if (user.role != 1) {
        throw new ForbiddenException("This user can't be an employer");
      }
      if (data.number) {
        if (!data.exp_month || !data.exp_year || !data.cvc) {
          throw new BadRequestException();
        }
        const newEmployer = this.employerRepository.create(data);
        const { number, exp_month, exp_year, cvc } = data;
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
        await this.stripeService.createPaymentMethod(customer.id, card);
        newEmployer.user = user;
        newEmployer.customerId = customer.id;
        return this.employerRepository.save(newEmployer);
      } else {
        const newEmployer = this.employerRepository.create(data);
        newEmployer.user = user;
        return this.employerRepository.save(newEmployer);
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async update(id: number, changes: UpdateEmployerDto) {
    const employer = await this.employerRepository.findOneBy({ id: id });
    if (!employer) {
      throw new NotFoundException(`Employer #${id} not found`);
    }
    try {
      if (changes.number) {
        if (changes.exp_month && changes.exp_year && changes.cvc) {
          if (employer.customerId) {
            const shifts = await this.shiftService.findByEmployer(employer.id);
            if (
              shifts.acceptedShifts.length > 0 ||
              shifts.activeShifts.length > 0
            ) {
              throw new ForbiddenException(
                "Can't change payment method with shifts in course",
              );
            }
            const { number, exp_month, exp_year, cvc } = changes;
            const card = {
              number: number,
              exp_month: exp_month,
              exp_year: exp_year,
              cvc: cvc,
            };
            await this.stripeService.updatePaymentMethod(
              employer.customerId,
              card,
            );
          } else {
            const { number, exp_month, exp_year, cvc } = changes;
            const fullName =
              employer.user.firstName + ' ' + employer.user.lastName;
            const customerData = {
              email: employer.user.email,
              name: fullName,
              description: employer.businessName,
            };
            const customer = await this.stripeService.createCustomer(
              customerData,
            );
            const card = {
              number: number,
              exp_month: exp_month,
              exp_year: exp_year,
              cvc: cvc,
            };
            await this.stripeService.createPaymentMethod(customer.id, card);
            employer.customerId = customer.id;
          }
        } else {
          throw new BadRequestException('All card information needed');
        }
      }
      this.employerRepository.merge(employer, changes);
      return this.employerRepository.save(employer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async updateStars(id: number, stars: number) {
    const employer = await this.employerRepository.findOneBy({ id: id });
    if (!employer) {
      throw new NotFoundException(`Employer #${id} not found`);
    }
    const newTotal = employer.stars + stars;
    const totalReviews = employer.totalReviews + 1;
    const newAvg = newTotal / totalReviews;
    const changes = {
      stars: newTotal,
      totalReviews: totalReviews,
      avgStars: newAvg,
    };
    return this.update(id, changes);
  }

  async uploadBusinessImg(employerId: number, file: Express.Multer.File) {
    try {
      const employer = await this.findOne(employerId);
      const fileUrl = await this.doSpaceService.uploadBusinessImg(
        file,
        employerId,
      );
      const newImg = this.imgRepository.create({ imgUrl: fileUrl });
      newImg.employer = employer;
      return this.imgRepository.save(newImg);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async remove(id: number) {
    const employer = await this.employerRepository.findOneBy({ id: id });
    if (!employer) {
      throw new NotFoundException(`Employer #${id} not found`);
    }
    return this.employerRepository.delete(id);
  }
}
