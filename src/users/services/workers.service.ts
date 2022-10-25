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
  CreateWorkerDto,
  FilterWorkersDto,
  StripeUserAccDto,
  UpdateWorkerDto,
} from '../dtos/workers.dto';
import { Worker } from '../entities/worker.entity';
import { UsersService } from './users.service';
import { StripeService } from '../../stripe/stripe.service';
import { DOSpacesService } from '../../spaces/services/doSpacesService';
import { Experience } from '../entities/experience.entity';
import { Address } from '../entities/address.entity';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(Worker) private workerRepository: Repository<Worker>,
    @InjectRepository(Experience)
    private experienceRepository: Repository<Experience>,
    @InjectRepository(Address) private addressRepository: Repository<Address>,
    private usersService: UsersService,
    private stripeService: StripeService,
    private doSpaceService: DOSpacesService,
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
    try {
      const user = await this.usersService.findOneById(data.userId);
      if (user.role != 2) {
        throw new ForbiddenException("This user can't be a worker");
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
      const newWorker = this.workerRepository.create(data);
      newWorker.user = user;
      const savedAddress = await this.addressRepository.save(newAddress);
      const worker = await this.workerRepository.save(newWorker);
      return {
        worker: worker,
        address: savedAddress,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.response.message);
    }
  }

  async update(id: number, changes: UpdateWorkerDto) {
    const worker = await this.workerRepository.findOneBy({ id: id });
    if (!worker) {
      throw new NotFoundException(`Worker #${id} not found`);
    }
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
            id: worker.user.id,
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
    this.workerRepository.merge(worker, changes);
    const savedWorker = await this.workerRepository.save(worker);
    return savedWorker;
  }

  async updateStars(id: number, stars: number) {
    const worker = await this.workerRepository.findOneBy({ id: id });
    if (!worker) {
      throw new NotFoundException(`Worker #${id} not found`);
    }
    const newTotal = worker.stars + stars;
    const totalReviews = worker.totalReviews + 1;
    const newAvg = newTotal / totalReviews;
    const changes = {
      stars: newTotal,
      totalReviews: totalReviews,
      avgStars: newAvg,
    };
    return this.update(id, changes);
  }

  async uploadExperienceVideo(workerId: number, file: Express.Multer.File) {
    try {
      const worker = await this.findOne(workerId);
      const fileUrl = await this.doSpaceService.uploadWorkerVideo(
        file,
        worker.id,
      );
      const experienceData = {
        videoUrl: fileUrl,
        worker: worker,
      };
      const newExperience = this.experienceRepository.create(experienceData);
      return this.experienceRepository.save(newExperience);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getDownloadFileUrl(workerId: number) {
    try {
      const experience = await this.experienceRepository.findOne({
        where: { worker: { id: workerId } },
      });
      const url = await this.doSpaceService.downloadFile(experience.videoUrl);
      return url;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async remove(id: number) {
    const worker = await this.workerRepository.findOneBy({ id: id });
    if (!worker) {
      throw new NotFoundException(`Worker #${id} not found`);
    }
    return this.workerRepository.delete(id);
  }

  async createStripeAccount(id: number, data: StripeUserAccDto) {
    try {
      const worker = await this.workerRepository.findOneBy({ id: id });
      if (!worker) {
        throw new NotFoundException(`Worker #${id} not found`);
      }
      const userAddress = await this.addressRepository.find({
        where: {
          user: {
            id: worker.user.id,
          },
          principal: true,
        },
      });
      if (!userAddress) {
        throw new BadRequestException('This user has not an address');
      }
      const accountData = {
        type: 'custom',
        country: 'US',
        email: worker.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          first_name: worker.user.firstName,
          last_name: worker.user.lastName,
          ssn_last_4: worker.ssn.toString().slice(-4),
          address: {
            line1: userAddress[0].address,
            postal_code: userAddress[0].postalCode,
            city: userAddress[0].city,
            state: userAddress[0].state,
          },
          dob: {
            day: worker.dayOfBirth,
            month: worker.monthOfBirth,
            year: worker.yearOfBirth,
          },
          email: worker.user.email,
          phone: worker.phone,
        },
        external_account: {
          object: 'bank_account',
          country: 'US',
          currency: 'usd',
          routing_number: data.routingNumber,
          account_number: data.accountNumber,
        },
        tos_acceptance: { date: Math.floor(Date.now() / 1000), ip: '8.8.8.8' },
        business_profile: {
          mcc: '7011',
          url: worker.personalUrl,
        },
      };
      const stripeAccount = await this.stripeService.createUserAccount(
        accountData,
      );
      if (stripeAccount.id) {
        const workerUpdated = await this.update(worker.id, {
          stripeId: stripeAccount.id,
        });
        return workerUpdated;
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
