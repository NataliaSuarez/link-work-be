import {
  ConflictException,
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
import { WorkerData } from '../entities/worker_data.entity';
import { UsersService } from './users.service';
import { StripeService } from '../../stripe/stripe.service';
import { DOSpacesService } from '../../spaces/services/doSpacesService';
import { WorkerExperience } from '../entities/worker_experience.entity';
import { Role, User } from '../entities/user.entity';
import { PostgresErrorCode } from 'src/common/enum/postgres-error-code.enum';
import { Address } from '../entities/address.entity';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(WorkerData)
    private workerRepository: Repository<WorkerData>,
    @InjectRepository(WorkerExperience)
    private experienceRepository: Repository<WorkerExperience>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Address) private addressRepository: Repository<Address>,
    private usersService: UsersService,
    private stripeService: StripeService,
    private doSpaceService: DOSpacesService,
  ) {}

  async findAll(params?: FilterWorkersDto) {
    return await this.userRepository.find({
      where: { role: Role.WORKER },
      relations: { workerData: true },
      skip: params?.offset ?? 0,
      take: params?.limit ?? 100,
    });
  }

  async findOne(workerUserId: string): Promise<User> {
    const worker = await this.usersService.findOneById(workerUserId, {
      workerData: true,
    });
    if (!worker) {
      throw new NotFoundException(`Worker not found`);
    }
    return worker;
  }

  async findByUserId(workerUserId: string): Promise<WorkerData> {
    const workerData = await this.workerRepository.findOneBy({
      user: { id: workerUserId },
    });
    if (!workerData) {
      throw new NotFoundException(`Worker data not found`);
    }
    return workerData;
  }

  async create(data: CreateWorkerDto, userId: string) {
    const user = await this.usersService.findOneById(userId);
    if (user.role !== Role.WORKER) {
      throw new ConflictException('The user has to be registered as a worker');
    }
    try {
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
      if (error.code === PostgresErrorCode.UNIQUE) {
        throw new ConflictException('User already has worker data');
      }
      throw new InternalServerErrorException();
    }
  }

  async update(workerData: WorkerData, changes: UpdateWorkerDto) {
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
        throw new BadRequestException(
          'To update an address you have to send all the address info',
        );
      }
    }
    try {
      const { address, city, state, postalCode } = changes;
      const modifyAddress = await this.addressRepository.findOne({
        where: {
          user: {
            id: workerData.user.id,
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

      const updatedWorker = this.workerRepository.merge(workerData, changes);
      const savedWorker = await this.workerRepository.save(updatedWorker);
      return savedWorker;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.response.message);
    }
  }

  async updateStars(workerData: WorkerData, stars: number) {
    const newTotal = workerData.stars + stars;
    const totalReviews = workerData.totalReviews + 1;
    const newAvg = newTotal / totalReviews;
    const changes = {
      stars: newTotal,
      totalReviews: totalReviews,
      avgStars: newAvg,
    };
    return await this.update(workerData, changes);
  }

  async uploadExperienceVideo(workerUserId: string, file: Express.Multer.File) {
    try {
      const workerUser = await this.usersService.findOneById(workerUserId);
      const fileUrl = await this.doSpaceService.uploadWorkerVideo(
        file,
        workerUserId,
      );
      const newExperience = this.experienceRepository.create({
        videoUrl: fileUrl,
        workerUser: workerUser,
      });
      return await this.experienceRepository.save(newExperience);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getDownloadFileUrl(workerUserId: string) {
    try {
      const experience = await this.experienceRepository.findOne({
        where: { workerUser: { id: workerUserId } },
      });
      const url = await this.doSpaceService.downloadFile(experience.videoUrl);
      return url;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async createStripeAccount(workerData: WorkerData, data: StripeUserAccDto) {
    try {
      const userAddress = await this.addressRepository.find({
        where: {
          user: {
            id: workerData.user.id,
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
        email: workerData.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          first_name: workerData.user.firstName,
          last_name: workerData.user.lastName,
          ssn_last_4: workerData.ssn.toString().slice(-4),
          address: {
            line1: userAddress[0].address,
            postal_code: userAddress[0].postalCode,
            city: userAddress[0].city,
            state: userAddress[0].state,
          },
          dob: {
            day: workerData.dayOfBirth,
            month: workerData.monthOfBirth,
            year: workerData.yearOfBirth,
          },
          email: workerData.user.email,
          phone: workerData.phone,
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
          url: workerData.personalUrl,
        },
      };
      const stripeAccount = await this.stripeService.createUserAccount(
        accountData,
      );
      if (stripeAccount.id) {
        const workerUpdated = await this.update(workerData, {
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
