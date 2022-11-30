import {
  ConflictException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
import { Role, ProfileStatus, User } from '../entities/user.entity';
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
    const workerData = await this.workerRepository.findOne({
      where: {
        user: {
          id: workerUserId,
        },
      },
      relations: { user: true },
    });
    if (!workerData) {
      throw new NotFoundException(`Worker data not found`);
    }
    return workerData;
  }

  async create(data: CreateWorkerDto, userId: string): Promise<WorkerData> {
    const user = await this.usersService.findOneById(userId);
    if (user.role !== Role.WORKER) {
      console.warn(`The user ${userId} is not a worker`);
      throw new ConflictException('The user cant be registered as a worker');
    }
    try {
      const newWorker = this.workerRepository.create(data);
      newWorker.user = user;
      const worker = await this.workerRepository.save(newWorker);
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
      await this.userRepository.update(
        { id: userId },
        { profileStatus: ProfileStatus.BANK_PENDING },
      );
      return await this.workerRepository.findOne({
        relations: {
          user: true,
        },
        where: {
          id: worker.id,
        },
      });
    } catch (error) {
      if (error.code === PostgresErrorCode.UNIQUE) {
        console.error(error);
        throw new ConflictException('User already has worker data');
      }
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(userId: string, changes: UpdateWorkerDto) {
    const worker = await this.findByUserId(userId);
    try {
      if (changes.addressData) {
        const modifyAddress = await this.addressRepository.findOne({
          where: {
            user: {
              id: userId,
            },
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
        this.addressRepository.merge(modifyAddress, newAddress);
        await this.addressRepository.save(modifyAddress);
        if (worker.stripeId) {
          await this.stripeService.updateAccount(worker.stripeId, {
            individual: {
              address: {
                line1: changes.addressData.address,
                postal_code: changes.addressData.postalCode,
                city: changes.addressData.city,
                state: changes.addressData.state,
              },
            },
          });
        }
      }

      const updatedWorker = this.workerRepository.merge(worker, changes);
      const savedWorker = await this.workerRepository.save(updatedWorker);
      return await this.workerRepository.findOne({
        relations: {
          user: true,
        },
        where: {
          id: savedWorker.id,
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.response.message);
    }
  }

  async updateStars(workerData: WorkerData, stars: number) {
    try {
      const newTotal = workerData.stars + stars;
      const totalReviews = workerData.totalReviews + 1;
      const newAvg = newTotal / totalReviews;
      const changes = {
        stars: newTotal,
        totalReviews: totalReviews,
        avgStars: newAvg,
      };
      return await this.update(workerData.user.id, changes);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
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
      console.error(error);
      throw new InternalServerErrorException(error.message);
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

  async createStripeAccount(userId: string, data: StripeUserAccDto) {
    try {
      const user = await this.usersService.findOneById(userId);
      if (!user) {
        throw new BadRequestException('Cant find an user');
      }
      const userAddress = await this.addressRepository.find({
        where: {
          user: {
            id: userId,
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
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          first_name: user.firstName,
          last_name: user.lastName,
          ssn_last_4: user.workerData.ssn.toString().slice(-4),
          address: {
            line1: userAddress[0].address,
            postal_code: userAddress[0].postalCode,
            city: userAddress[0].city,
            state: userAddress[0].state,
          },
          dob: {
            day: user.workerData.dayOfBirth,
            month: user.workerData.monthOfBirth,
            year: user.workerData.yearOfBirth,
          },
          email: user.email,
          phone: user.workerData.phone,
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
          url: user.workerData.personalUrl,
        },
      };
      const stripeAccount = await this.stripeService.createUserAccount(
        accountData,
      );
      console.log(stripeAccount);
      if (stripeAccount.id) {
        const workerUpdated = await this.update(userId, {
          stripeId: stripeAccount.id,
        });
        return workerUpdated;
      }
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async checkStripeAccount(userId: string) {
    const worker = await this.findByUserId(userId);
    if (!worker.stripeId) {
      throw new BadRequestException('This worker has not stripe id');
    }
    try {
      const stripeData = await this.stripeService.retrieveAccount(
        worker.stripeId,
      );
      if (
        stripeData.capabilities.transfers === 'active' &&
        stripeData.capabilities.card_payments === 'active'
      ) {
        await this.userRepository.update(
          { id: userId },
          { profileStatus: ProfileStatus.COMPLETE },
        );
      }
      return stripeData;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
