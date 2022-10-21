import {
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

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(Worker) private workerRepository: Repository<Worker>,
    @InjectRepository(Experience)
    private experienceRepository: Repository<Experience>,
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
      const newWorker = this.workerRepository.create(data);
      newWorker.user = user;
      return this.workerRepository.save(newWorker);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async update(id: number, changes: UpdateWorkerDto) {
    const worker = await this.workerRepository.findOneBy({ id: id });
    if (!worker) {
      throw new NotFoundException(`Worker #${id} not found`);
    }
    this.workerRepository.merge(worker, changes);
    return this.workerRepository.save(worker);
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
            line1: worker.address,
            postal_code: worker.postalCode,
            city: worker.city,
            state: worker.state,
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
    }
  }
}
