import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { PostgresErrorCode } from '../../common/enum/postgres-error-code.enum';
import { OfferStatus } from '../../offers_and_shifts/entities/offer.entity';
import { ShiftStatus } from '../../offers_and_shifts/entities/shift.entity';
import { Repository, Equal, LessThan, FindOptionsRelations } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as Cryptr from 'cryptr';

import {
  CreateUserDto,
  FilterUsersDto,
  UpdateUserDto,
} from '../dtos/users.dto';
import { Role, User } from '../entities/user.entity';
import { DOSpacesService } from '../../spaces/services/doSpacesService';
import { UserImage, ImageType } from '../entities/user_image.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserImage)
    private imgRepository: Repository<UserImage>,
    private doSpaceService: DOSpacesService,
    private readonly configService: ConfigService,
  ) {}

  async findAllFiltered(params?: FilterUsersDto) {
    const { limit, offset, role } = params;
    const cryptr = new Cryptr(this.configService.get('CRYPTR_SECRET'));
    if (role) {
      if (role === Role.WORKER) {
        const users = await this.userRepository.find({
          where: { role: Equal(Role.WORKER) },
          take: limit,
          skip: offset,
          relations: { workerData: true },
        });
        const modifiedUsers = [];
        users.forEach((user) => {
          if (user.workerData.ssn) {
            const decriptedSSN = cryptr.decrypt(user.workerData.ssn);
            user.workerData.ssn = decriptedSSN.slice(-4);
          }
          if (user.workerData.uscis) {
            const decriptedUSCIS = cryptr.decrypt(user.workerData.uscis);
            user.workerData.uscis = decriptedUSCIS.slice(-4);
          }
          modifiedUsers.push(user);
        });
        return modifiedUsers;
      }
      return await this.userRepository.find({
        where: { role: Equal(Role.EMPLOYER) },
        take: limit,
        skip: offset,
        relations: { employerData: true },
      });
    }
    const users = [];
    const workers = await this.userRepository.find({
      where: { role: Equal(Role.WORKER) },
      take: limit,
      skip: offset,
      relations: { workerData: true },
    });
    workers.forEach((user) => {
      if (user.workerData.ssn) {
        const decriptedSSN = cryptr.decrypt(user.workerData.ssn);
        user.workerData.ssn = decriptedSSN.slice(-4);
      }
      if (user.workerData.uscis) {
        const decriptedUSCIS = cryptr.decrypt(user.workerData.uscis);
        user.workerData.uscis = decriptedUSCIS.slice(-4);
      }
      users.push(user);
    });
    const employers = await this.userRepository.find({
      where: { role: Equal(Role.EMPLOYER) },
      take: limit,
      skip: offset,
      relations: { employerData: true },
    });
    return users.concat(employers);
  }

  async findOneById(
    id: string,
    relations?: FindOptionsRelations<User>,
  ): Promise<User> {
    if (!relations) {
      relations = { userImages: true };
    }
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === Role.WORKER && user.workerData) {
      const cryptr = new Cryptr(this.configService.get('CRYPTR_SECRET'));
      if (user.workerData.ssn) {
        const decriptedSSN = cryptr.decrypt(user.workerData.ssn);
        user.workerData.ssn = decriptedSSN.slice(-4);
      }
      if (user.workerData.uscis) {
        const decriptedUSCIS = cryptr.decrypt(user.workerData.uscis);
        user.workerData.uscis = decriptedUSCIS.slice(-4);
      }
    }
    return user;
  }

  async findOneByAppleIdIdentifier(
    appleIdIdentifier: string,
    relations?: FindOptionsRelations<User>,
  ): Promise<User> {
    if (!relations) {
      relations = { userImages: true };
    }

    const user = await this.userRepository.findOne({
      where: { appleIdIdentifier: appleIdIdentifier },
      relations,
    });

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email: email },
      withDeleted: true,
    });
  }

  async findCredentials(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        desactivatedAt: true,
        email: true,
        role: true,
        password: true,
        verified: true,
        refreshToken: true,
        registerType: true,
      },
      withDeleted: true,
    });
    if (user.desactivatedAt) {
      await this.userRepository.restore(user.id);
    }
    return user;
  }

  async create(data: CreateUserDto) {
    const newUser = this.userRepository.create(data);
    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      if (error.code === PostgresErrorCode.UNIQUE) {
        throw new ConflictException('User email unavailable');
      }
      throw new InternalServerErrorException();
    }
  }

  async createWithGoogle(data: CreateUserDto) {
    const { email, firstName, lastName, role } = data;
    const newUser = await this.userRepository.create({
      email,
      firstName,
      lastName,
      registerType: 1,
      verified: true,
      role: role,
    });
    await this.userRepository.save(newUser);
    return newUser;
  }

  async uploadUserImg(userId: string, file: Express.Multer.File) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
        relations: { userImages: true },
      });
      const fileName = file.originalname.split('.');
      const regExp = /^businessImg/;

      if (regExp.test(fileName[0])) {
        const fileUrl = await this.doSpaceService.uploadBusinessImg(
          file,
          userId,
        );
        const newImg = this.imgRepository.create({
          imgUrl: fileUrl,
        });
        newImg.user = user;
        newImg.type = ImageType.BUSINESS_IMG;
        return await this.imgRepository.save(newImg);
      }

      if (user.userImages.length > 0) {
        let type;
        switch (fileName[0]) {
          case ImageType.PROFILE_IMG:
            type = ImageType.PROFILE_IMG;
            break;

          case ImageType.SIGNATURE_IMG:
            type = ImageType.SIGNATURE_IMG;
            break;

          case ImageType.ID_FRONT_IMG:
            type = ImageType.ID_FRONT_IMG;
            break;

          case ImageType.ID_BACK_IMG:
            type = ImageType.ID_BACK_IMG;
            break;
        }
        const imgExists = await this.imgRepository.findOne({
          where: {
            type: type,
            user: {
              id: userId,
            },
          },
        });
        if (imgExists) {
          await this.doSpaceService.deleteFile(imgExists.imgUrl);
          const fileUrl = await this.doSpaceService.uploadImg(file, userId);
          return await this.imgRepository.update(
            { id: imgExists.id },
            {
              imgUrl: fileUrl,
            },
          );
        } else {
          const fileUrl = await this.doSpaceService.uploadImg(file, userId);
          const newImg = this.imgRepository.create({
            imgUrl: fileUrl,
          });
          newImg.user = user;
          if (fileName[0] == ImageType.PROFILE_IMG) {
            newImg.type = ImageType.PROFILE_IMG;
          } else if (fileName[0] == ImageType.ID_BACK_IMG) {
            newImg.type = ImageType.ID_BACK_IMG;
          } else if (fileName[0] == ImageType.ID_FRONT_IMG) {
            newImg.type = ImageType.ID_FRONT_IMG;
          } else if (fileName[0] == ImageType.SIGNATURE_IMG) {
            newImg.type = ImageType.SIGNATURE_IMG;
          }
          return await this.imgRepository.save(newImg);
        }
      } else {
        const fileUrl = await this.doSpaceService.uploadImg(file, userId);
        const newImg = this.imgRepository.create({
          imgUrl: fileUrl,
        });
        newImg.user = user;
        if (fileName[0] == ImageType.PROFILE_IMG) {
          newImg.type = ImageType.PROFILE_IMG;
        } else if (fileName[0] == ImageType.ID_BACK_IMG) {
          newImg.type = ImageType.ID_BACK_IMG;
        } else if (fileName[0] == ImageType.ID_FRONT_IMG) {
          newImg.type = ImageType.ID_FRONT_IMG;
        } else if (fileName[0] == ImageType.SIGNATURE_IMG) {
          newImg.type = ImageType.SIGNATURE_IMG;
        }
        return await this.imgRepository.save(newImg);
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteUserImg(imgId: string, imgUrl: string) {
    try {
      await this.imgRepository.delete(imgId);
      await this.doSpaceService.deleteFile(imgUrl);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async update(user: User, changes: UpdateUserDto) {
    if (
      changes.email ||
      changes.firstName ||
      changes.lastName ||
      (changes.role && user.role != Role.UNASSIGNED)
    ) {
      throw new BadRequestException('You cannot change this data');
    }
    try {
      if (changes.password) {
        if (changes.password != changes.repeatPassword) {
          throw new BadRequestException('Password must be the same');
        }
        // Hash password
        const hash = await this.hashData(changes.password);
        return await this.userRepository.update(
          { id: user.id },
          { password: hash },
        );
      }
      await this.userRepository.update({ id: user.id }, changes);
      return await this.userRepository.findOneBy({ id: user.id });
    } catch (error) {
      console.error(error);
      if (error.code === PostgresErrorCode.UNIQUE) {
        throw new ConflictException('User email unavailable');
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  private async isUserDeletable(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    if (user.role === Role.EMPLOYER) {
      if (user.offersOwnedByEmployer) {
        user.offersOwnedByEmployer.forEach((offer) => {
          if (
            offer.status !== OfferStatus.DONE &&
            offer.status !== OfferStatus.CANCELED
          ) {
            throw new ConflictException(
              'Cannot delete an employer with active offers',
            );
          }
        });
      }
    }
    if (user.role === Role.WORKER) {
      if (user.appliedOffers) {
        user.appliedOffers.forEach((offer) => {
          if (
            offer.status !== OfferStatus.DONE &&
            offer.status !== OfferStatus.CANCELED
          ) {
            throw new ConflictException(
              'Cannot delete an employer with active offers',
            );
          }
        });
      }
      if (user.workerShifts) {
        user.workerShifts.forEach((shift) => {
          if (
            shift.status !== ShiftStatus.DONE &&
            shift.status !== ShiftStatus.CANCELED &&
            shift.status !== ShiftStatus.UNCONFIRMED
          ) {
            throw new ConflictException(
              'Cannot delete a worker with active or accepted shifts',
            );
          }
        });
      }
    }
    return true;
  }

  async desactivate(userId: string, desactivate: boolean) {
    let reactivateRes;
    const user = await this.findOneById(userId);
    try {
      if (desactivate) {
        await this.isUserDeletable(userId);
        await this.userRepository.softDelete(userId);
        console.log(`User ${userId} desactivated`);
        return { message: `User ${user.email} desactivated` };
      } else {
        reactivateRes = await this.userRepository.restore(userId);
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
    if (reactivateRes.affected !== 0) {
      return { message: `User ${user.email} reactivated` };
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async delete(userId: string) {
    await this.isUserDeletable(userId);
    try {
      await this.userRepository.delete(userId);
      console.log(`User ${userId} deleted permanently`);
      return { message: 'User deleted permanently' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteAllDeactivatedUsers(minDeactivationDatetime: Date) {
    try {
      await this.userRepository.delete({
        desactivatedAt: LessThan(minDeactivationDatetime),
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async verifyUser(email: string) {
    return this.userRepository.update(
      { email },
      {
        verified: true,
      },
    );
  }
}
