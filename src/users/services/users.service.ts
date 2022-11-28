import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { PostgresErrorCode } from 'src/common/enum/postgres-error-code.enum';
import { OfferStatus } from '../../offers_and_shifts/entities/offer.entity';
import { ShiftStatus } from '../../offers_and_shifts/entities/shift.entity';
import { Repository, Equal, LessThan, FindOptionsRelations } from 'typeorm';

import {
  CreateUserDto,
  FilterUsersDto,
  UpdateUserDto,
} from '../dtos/users.dto';
import { Role, User } from '../entities/user.entity';
import { DOSpacesService } from '../../spaces/services/doSpacesService';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private doSpaceService: DOSpacesService,
  ) {}

  async findAllFiltered(params?: FilterUsersDto) {
    if (params) {
      const { limit, offset, role } = params;
      return await this.userRepository.find({
        where: { role: Equal(role) },
        take: limit,
        skip: offset,
      });
    } else {
      return await this.userRepository.find();
    }
  }

  async findOneById(
    id: string,
    relations?: FindOptionsRelations<User>,
  ): Promise<User> {
    if (!relations) {
      relations = { employerBusinessImages: true };
    }
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations,
    });
    if (user.profileImg) {
      const signedURL = await this.doSpaceService.tempAccessToPrivateFileUrl(
        user.profileImg,
      );
      user.profileImg = signedURL;
    }
    if (user.role === Role.EMPLOYER) {
      if (user.employerBusinessImages.length > 0) {
        let i = 0;
        for (const img of user.employerBusinessImages) {
          console.log(img.imgUrl);
          const signedimg =
            await this.doSpaceService.tempAccessToPrivateFileUrl(img.imgUrl);
          user.employerBusinessImages[i].imgUrl = signedimg;
          i++;
        }
      }
      return user;
    } else if (user.role === Role.WORKER) {
      if (user.workerExperience) {
        const signedExperience =
          await this.doSpaceService.tempAccessToPrivateFileUrl(
            user.workerExperience.videoUrl,
          );
        user.workerExperience.videoUrl = signedExperience;
      }
      return user;
    }
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
    });
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
      role: 0,
    });
    await this.userRepository.save(newUser);
    return newUser;
  }

  async uploadProfileImg(userId: string, file: Express.Multer.File) {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      const fileUrl = await this.doSpaceService.uploadProfileImg(file, userId);
      const updatedUser = await this.update(user, { profileImg: fileUrl });
      return updatedUser;
    } catch (error) {
      console.error(error);
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
        this.userRepository.merge(user, { password: hash });
        return await this.userRepository.save(user);
      }
      this.userRepository.merge(user, changes);
      return await this.userRepository.save(user);
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
      if (user.offersAppliedToByWorker) {
        user.offersAppliedToByWorker.forEach((offer) => {
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
    try {
      if (desactivate) {
        await this.isUserDeletable(userId);
        await this.userRepository.softDelete(userId);
        console.log(`User ${userId} desactivated`);
        return { message: `User ${userId} desactivated` };
      } else {
        reactivateRes = await this.userRepository.restore(userId);
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
    if (reactivateRes.affected !== 0) {
      return { message: `User ${userId} reactivated` };
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
