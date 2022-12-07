import {
  ConflictException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as Cryptr from 'cryptr';

import {
  CreateWorkerDto,
  FilterWorkersDto,
  StripeBankAccDto,
  UpdateWorkerDto,
} from '../dtos/workers.dto';
import { WorkerData } from '../entities/worker_data.entity';
import { UsersService } from './users.service';
import { StripeService } from '../../stripe/stripe.service';
import { DOSpacesService } from '../../spaces/services/doSpacesService';
import { Role, ProfileStatus, User } from '../entities/user.entity';
import { PostgresErrorCode } from 'src/common/enum/postgres-error-code.enum';
import { Address } from '../entities/address.entity';
import { ImageType } from '../entities/user_image.entity';

@Injectable()
export class WorkersService {
  constructor(
    @InjectRepository(WorkerData)
    private workerRepository: Repository<WorkerData>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Address) private addressRepository: Repository<Address>,
    private usersService: UsersService,
    private stripeService: StripeService,
    private doSpaceService: DOSpacesService,
    private readonly configService: ConfigService,
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
      relations: {
        user: {
          userImages: true,
        },
      },
    });
    if (!workerData) {
      throw new NotFoundException(`Worker data not found`);
    }

    const cryptr = new Cryptr(this.configService.get('CRYPTR_SECRET'));
    if (workerData.ssn) {
      const decriptedSSN = cryptr.decrypt(workerData.ssn);
      workerData.ssn = decriptedSSN.slice(-4);
    }
    if (workerData.uscis) {
      const decriptedUSCIS = cryptr.decrypt(workerData.uscis);
      workerData.uscis = decriptedUSCIS.slice(-4);
    }

    return workerData;
  }

  async create(data: CreateWorkerDto, userId: string): Promise<WorkerData> {
    const user = await this.usersService.findOneById(userId);
    if (user.role !== Role.WORKER) {
      console.warn(`The user ${userId} is not a worker`);
      throw new ConflictException('The user cant be registered as a worker');
    }
    if (!user.firstName || !user.lastName) {
      console.warn(`The user ${userId} needs a full name`);
      throw new ConflictException(
        'The user cant be registered without full name',
      );
    }
    if (!data.personalUrl) {
      data.personalUrl = this.configService.get('APP_PLACEHOLDER_1');
    }
    const cryptr = new Cryptr(this.configService.get('CRYPTR_SECRET'));
    if (data.ssn) {
      const encriptedSSN = await cryptr.encrypt(data.ssn);
      data.ssn = encriptedSSN;
    }
    if (data.uscis) {
      const encriptedUSCIS = await cryptr.encrypt(data.uscis);
      data.uscis = encriptedUSCIS;
    }
    try {
      const newWorker = this.workerRepository.create(data);
      newWorker.user = user;
      const worker = await this.workerRepository.save(newWorker);
      if (user.address.length > 0) {
        const newAddress = {
          address: data.addressData.address,
          city: data.addressData.city,
          state: data.addressData.state,
          postalCode: data.addressData.postalCode,
          lat: data.addressData.lat,
          long: data.addressData.long,
          principal: true,
        };
        const address = await this.addressRepository.findOne({
          where: {
            user: {
              id: user.id,
            },
          },
        });
        await this.addressRepository.update({ id: address.id }, newAddress);
        return await this.workerRepository.findOne({
          where: {
            id: worker.id,
          },
          relations: {
            user: {
              userImages: true,
            },
          },
        });
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
      await this.userRepository.update(
        { id: userId },
        { profileStatus: ProfileStatus.BANK_PENDING },
      );
      return await this.workerRepository.findOne({
        where: {
          id: worker.id,
        },
        relations: {
          user: {
            userImages: true,
          },
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
    const worker = await this.workerRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

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

      const cryptr = new Cryptr(this.configService.get('CRYPTR_SECRET'));
      if (changes.ssn) {
        const encriptedSSN = cryptr.encrypt(changes.ssn);
        changes.ssn = encriptedSSN;
      }
      if (changes.uscis) {
        const encriptedUSCIS = cryptr.encrypt(changes.uscis);
        changes.uscis = encriptedUSCIS;
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
      console.error(error);
      throw new InternalServerErrorException(error.message);
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
      const worker = await this.workerRepository.findOne({
        where: {
          user: {
            id: workerUserId,
          },
        },
      });
      if (!worker) {
        throw new ForbiddenException('This user has not worker profile');
      }
      const fileUrl = await this.doSpaceService.uploadWorkerVideo(
        file,
        workerUserId,
      );
      const updatedWorker = await this.update(workerUserId, {
        workerExperience: fileUrl,
      });
      return updatedWorker;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getDownloadFileUrl(workerUserId: string) {
    try {
      const worker = await this.workerRepository.findOne({
        where: {
          user: {
            id: workerUserId,
          },
        },
      });
      const url = await this.doSpaceService.downloadFile(
        worker.workerExperience,
      );
      return url;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async generateStripeAccountData(userId: string, data: StripeBankAccDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: { workerData: true },
      });
      if (!user) {
        throw new BadRequestException('Cant find an user');
      }
      if (user.workerData.stripeId) {
        await this.stripeService.updateAccount(user.workerData.stripeId, {
          external_account: {
            object: 'bank_account',
            country: 'US',
            currency: 'usd',
            routing_number: data.routingNumber,
            account_number: data.accountNumber,
          },
        });
        const workerUpdated = await this.update(userId, {
          accountLastFour: data.accountNumber.slice(-4),
          routingLastFour: data.routingNumber.slice(-4),
        });
        return workerUpdated;
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

      const cryptr = new Cryptr(this.configService.get('CRYPTR_SECRET'));
      const decriptedSSN = cryptr.decrypt(user.workerData.ssn);

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
          ssn_last_4: decriptedSSN.slice(-4),
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
          accountLastFour: data.accountNumber.slice(-4),
          routingLastFour: data.routingNumber.slice(-4),
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

  async uploadWorkerFiles(userId: string, files: Express.Multer.File[]) {
    try {
      for (const file of files) {
        const fileName = file.originalname.split('.');
        if (fileName[1] == 'mp4') {
          if (file.mimetype != 'video/mp4') {
            throw new BadRequestException('Error in video mimetype');
          }
          await this.uploadExperienceVideo(userId, file);
        } else {
          await this.usersService.uploadUserImg(userId, file);
          if (fileName[0] == ImageType.SIGNATURE_IMG) {
            await this.update(userId, { signed: true });
          }
        }
      }
      return true;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
