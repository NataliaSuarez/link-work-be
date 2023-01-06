import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateEmployerDto,
  EmployerEditType,
  UpdateEmployerDto,
} from '../dtos/employers.dto';
import { UsersService } from './users.service';
import { StripeService } from '../../stripe/stripe.service';
import { DOSpacesService } from '../../spaces/services/doSpacesService';
import { ShiftsService } from '../../offers_and_shifts/services/shifts.service';
import { Role } from '../entities/user.entity';
import { PostgresErrorCode } from '../../common/enum/postgres-error-code.enum';
import { Address } from '../entities/address.entity';
import { CreateAddressDto } from '../dtos/users.dto';
import { EmployerData } from '../entities/employer_data.entity';
import { UserImage, ImageType } from '../entities/user_image.entity';

@Injectable()
export class EmployersService {
  constructor(
    @InjectRepository(EmployerData)
    private employerRepository: Repository<EmployerData>,
    @InjectRepository(UserImage)
    private imgRepository: Repository<UserImage>,
    @InjectRepository(Address) private addressRepository: Repository<Address>,
    private usersService: UsersService,
    private stripeService: StripeService,
    private doSpaceService: DOSpacesService,
    private shiftService: ShiftsService,
  ) {}

  async findByUserId(id: string): Promise<EmployerData> {
    const employer = await this.employerRepository.findOne({
      where: {
        user: {
          id: id,
        },
      },
      relations: { user: true },
    });
    return employer;
  }

  async createEmployerData(
    data: CreateEmployerDto,
    userId: string,
  ): Promise<EmployerData> {
    try {
      const user = await this.usersService.findOneById(userId, {
        employerData: true,
        userImages: true,
        address: true,
      });
      if (user.role !== Role.EMPLOYER) {
        throw new ForbiddenException('User needs to be registered as employer');
      }
      if (!data.description) {
        data.description = '';
      }
      const newAddress = this.addressRepository.create({
        address: data.addressData.address,
        city: data.addressData.city,
        state: data.addressData.state,
        postalCode: data.addressData.postalCode,
        lat: data.addressData.lat,
        long: data.addressData.long,
        principal: true,
      });
      newAddress.user = user;
      await this.addressRepository.save(newAddress);
      if (data.cardData) {
        const newEmployer = await this.employerRepository.create(data);
        const { number, exp_month, exp_year, cvc } = data.cardData;
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
        const cardLastFour = number.toString().slice(-4);
        await this.stripeService.createPaymentMethod(customer.id, card);
        newEmployer.user = user;
        newEmployer.customerId = customer.id;
        newEmployer.lastFour = cardLastFour;
        const savedEmployer = await this.employerRepository.save(newEmployer);
        return await this.employerRepository.findOne({
          relations: {
            user: true,
          },
          where: {
            user: {
              id: savedEmployer.user.id,
            },
          },
        });
      } else {
        const newEmployer = await this.employerRepository.create(data);
        newEmployer.user = user;
        const savedEmployer = await this.employerRepository.save(newEmployer);
        return await this.employerRepository.findOne({
          relations: {
            user: {
              userImages: true,
            },
          },
          where: {
            user: {
              id: savedEmployer.user.id,
            },
          },
        });
      }
    } catch (error) {
      console.error(error);
      if (error.code === PostgresErrorCode.UNIQUE) {
        throw new ConflictException('User already has employer data');
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(
    userId: string,
    payload: UpdateEmployerDto,
    editType?: EmployerEditType,
  ) {
    const employerData = await this.findByUserId(userId);
    if (!employerData) {
      throw new NotFoundException('User employer data not found');
    }
    let changes: UpdateEmployerDto = {};

    if (editType) {
      switch (editType) {
        case EmployerEditType.CARD_DATA:
          changes.cardData = payload.cardData;
          break;

        case EmployerEditType.OTHER:
          const { cardData, ...newPayload } = payload;
          changes = newPayload;
          break;
      }
    } else {
      changes = payload;
    }

    try {
      if (changes.addressData) {
        const modifyAddress = await this.addressRepository.findOne({
          where: {
            user: {
              id: employerData.user.id,
            },
            principal: true,
          },
        });
        const newAddress = {
          address: changes.addressData.address,
          city: changes.addressData.city,
          state: changes.addressData.state,
          postalCode: changes.addressData.postalCode,
          lat: changes.addressData.lat,
          long: changes.addressData.long,
        };
        await this.addressRepository.update(modifyAddress.id, newAddress);
      }
      if (changes.cardData) {
        if (employerData.customerId) {
          const shifts = await this.shiftService.findByEmployerUserId(
            employerData.user.id,
          );
          if (
            shifts.acceptedShifts.length > 0 ||
            shifts.activeShifts.length > 0
          ) {
            throw new ForbiddenException(
              "Can't change payment method with shifts in course",
            );
          }
          const { number, exp_month, exp_year, cvc } = changes.cardData;
          const card = {
            number: number,
            exp_month: exp_month,
            exp_year: exp_year,
            cvc: cvc,
          };
          const cardLastFour = number.toString().slice(-4);
          employerData.lastFour = cardLastFour;
          await this.stripeService.updatePaymentMethod(
            employerData.customerId,
            card,
          );
        } else {
          const { number, exp_month, exp_year, cvc } = changes.cardData;
          const fullName =
            employerData.user.firstName + ' ' + employerData.user.lastName;
          const customerData = {
            email: employerData.user.email,
            name: fullName,
            description: employerData.businessName,
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
          const cardLastFour = number.toString().slice(-4);
          employerData.lastFour = cardLastFour;
          await this.stripeService.createPaymentMethod(customer.id, card);
          employerData.customerId = customer.id;
        }
      }
      this.employerRepository.merge(employerData, changes);
      await this.employerRepository.save(employerData);
      return await this.employerRepository.findOne({
        relations: {
          user: true,
        },
        where: {
          id: employerData.id,
        },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async addAddress(userId: string, data: CreateAddressDto) {
    try {
      const user = await this.usersService.findOneById(userId);
      const newAddress = await this.addressRepository.create(data);
      newAddress.principal = false;
      newAddress.user = user;
      return await this.addressRepository.save(newAddress);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteAddress(addressId: string) {
    try {
      return await this.addressRepository.delete(addressId);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateStars(employerUserId: string, stars: number) {
    const employerData = await this.findByUserId(employerUserId);
    const newTotal = employerData.stars + stars;
    const totalReviews = employerData.totalReviews + 1;
    const newAvg = newTotal / totalReviews;
    const changes = {
      stars: newTotal,
      totalReviews: totalReviews,
      avgStars: newAvg,
    };
    return await this.update(employerUserId, changes);
  }

  async uploadBusinessImg(employerUserId: string, file: Express.Multer.File) {
    try {
      const employerUser = await this.usersService.findOneById(employerUserId);
      const fileUrl = await this.doSpaceService.uploadBusinessImg(
        file,
        employerUserId,
      );
      const newImg = this.imgRepository.create({
        imgUrl: fileUrl,
        type: ImageType.BUSINESS_IMG,
      });
      newImg.user = employerUser;
      return await this.imgRepository.save(newImg);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async retrieveStripeData(userId: string) {
    const employer = await this.findByUserId(userId);
    if (!employer.customerId) {
      throw new BadRequestException('Has not customer ID');
    }
    const stripeData = await this.stripeService.retrieveCustomer(
      employer.customerId,
    );
    if (stripeData.invoice_settings.default_payment_method) {
      const paymentMethod = await this.stripeService.retrievePaymentMethod(
        employer.customerId,
      );
      return {
        stripeAccountData: stripeData,
        paymentMethodData: paymentMethod,
      };
    }
    return {
      stripeAccountData: stripeData,
      paymentMethodData: null,
    };
  }

  async uploadEmployerFiles(userId: string, files: Express.Multer.File[]) {
    const businessImgs = await this.imgRepository.find({
      where: {
        user: {
          id: userId,
        },
        type: ImageType.BUSINESS_IMG,
      },
    });
    let flag = 0;
    const regExp = /^businessImg/;
    try {
      for (const file of files) {
        const fileName = file.originalname.split('.');
        if (regExp.test(fileName[0])) {
          flag = 1;
        }
        await this.usersService.uploadUserImg(userId, file);
      }
      if (flag != 0 && businessImgs) {
        for (const img of businessImgs) {
          await this.usersService.deleteUserImg(img.id, img.imgUrl);
        }
      }
      return true;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
