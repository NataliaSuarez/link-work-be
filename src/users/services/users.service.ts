import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostgresErrorCode } from 'src/common/enum/postgres-error-code.enum';
import { OfferStatus } from 'src/offers_and_shifts/entities/offer.entity';
import { ShiftStatus } from 'src/offers_and_shifts/entities/shift.entity';
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
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations,
    });
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findCredentials(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        deactivatedAt: true,
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
      role,
    });
    await this.userRepository.save(newUser);
    return newUser;
  }

  async uploadProfileImg(userId: string, file: Express.Multer.File) {
    try {
      const user = await this.findOneById(userId);
      const fileUrl = await this.doSpaceService.uploadProfileImg(file, userId);
      const updatedUser = await this.update(user, { profileImg: fileUrl });
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async update(user: User, changes: UpdateUserDto) {
    try {
      this.userRepository.merge(user, changes);
      return await this.userRepository.save(user);
    } catch (error) {
      if (error.code === PostgresErrorCode.UNIQUE) {
        throw new ConflictException('User email unavailable');
      }
      throw new InternalServerErrorException();
    }
  }

  private async isUserDeletable(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });
    if (user.role === Role.EMPLOYER) {
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
    if (user.role === Role.WORKER) {
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

    return true;
  }

  async deactivate(userId: string, deactivate = true) {
    await this.isUserDeletable(userId);
    let reactivateRes;
    try {
      if (deactivate) {
        await this.userRepository.softDelete(userId);
        return { message: 'User deactivated' };
      } else {
        reactivateRes = await this.userRepository.restore(userId);
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
    if (reactivateRes.affected !== 0) {
      return { message: 'User reactivated' };
    } else {
      throw new NotFoundException('User not found');
    }
  }

  async delete(userId: string) {
    await this.isUserDeletable(userId);
    try {
      await this.userRepository.delete(userId);
      return { message: 'User deleted permanently' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async deleteAllDeactivatedUsers(minDeactivationDatetime: Date) {
    try {
      await this.userRepository.delete({
        deactivatedAt: LessThan(minDeactivationDatetime),
      });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
