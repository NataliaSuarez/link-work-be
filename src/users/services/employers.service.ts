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
import { Address } from '../entities/address.entity';

@Injectable()
export class EmployersService {
  constructor(
    @InjectRepository(Employer)
    private employerRepository: Repository<Employer>,
    @InjectRepository(BusinessImages)
    private imgRepository: Repository<BusinessImages>,
    @InjectRepository(Address) private addressRepository: Repository<Address>,
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
      const { address, city, state, postalCode } = data;
      const newAddress = this.addressRepository.create({
        address: address,
        city: city,
        state: state,
        postalCode: postalCode,
        principal: true,
      });
      newAddress.user = user;
      await this.addressRepository.save(newAddress);
      if (data.number) {
        if (!data.exp_month || !data.exp_year || !data.cvc) {
          throw new BadRequestException();
        }
        const newEmployer = await this.employerRepository.create(data);
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
        const savedEmployer = await this.employerRepository.save(newEmployer);
        const rta = {
          employer: savedEmployer,
          cardNumber: card.number,
        };
        return rta;
      } else {
        const newEmployer = await this.employerRepository.create(data);
        newEmployer.user = user;
        const employerSaved = await this.employerRepository.save(newEmployer);
        return employerSaved;
      }
    } catch (error) {
      throw new InternalServerErrorException(error.response.message);
    }
  }

  async update(id: number, changes: UpdateEmployerDto) {
    const employer = await this.employerRepository.findOneBy({ id: id });
    if (!employer) {
      throw new NotFoundException(`Employer #${id} not found`);
    }
    try {
      if (
        changes.address ||
        changes.city ||
        changes.state ||
        changes.postalCode
      ) {
        if (
          !changes.address ||
          !changes.city ||
          !changes.state ||
          !changes.postalCode
        ) {
          throw new ForbiddenException(
            'To update an address you have to send all the address info',
          );
        }
        const { address, city, state, postalCode } = changes;
        const modifyAddress = await this.addressRepository.findOne({
          where: {
            user: {
              id: employer.user.id,
            },
          },
        });
        const newAddress = {
          address: address,
          city: city,
          state: state,
          postalCode: postalCode,
        };
        this.addressRepository.merge(modifyAddress, newAddress);
        await this.addressRepository.save(modifyAddress);
      }
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
      throw new InternalServerErrorException(error.response.message);
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
