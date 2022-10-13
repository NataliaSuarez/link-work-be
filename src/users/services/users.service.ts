import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostgresErrorCode } from 'src/common/enum/postgres-error-code.enum';
import { Repository, Equal, FindOptionsWhere, LessThan } from 'typeorm';

import {
  CreateUserDto,
  FilterUsersDto,
  UpdateUserDto,
} from '../dtos/users.dto';
import { Users } from '../entities/users.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) {}

  async findAll(params?: FilterUsersDto) {
    if (params) {
      const where: FindOptionsWhere<Users> = {};
      const { limit, offset } = params;
      const { role } = params;
      if (role) {
        where.role = Equal(role);
      }
      return await this.userRepository.find({
        where,
        take: limit,
        skip: offset,
      });
    }
    return await this.userRepository.find();
  }

  async findOneById(id: number): Promise<Users> {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<Users> {
    const user = await this.userRepository.findOne({ where: { email: email } });
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

  async update(user: Users, changes: UpdateUserDto) {
    this.userRepository.merge(user, changes);
    return await this.userRepository.save(user);
  }

  async deactivate(userId: number, deactivate = true) {
    try {
      if (deactivate) {
        await this.userRepository.softDelete(userId);
        return { message: 'User deactivated' };
      } else {
        const res = await this.userRepository.restore(userId);
        if (res.affected !== 0) {
          return { message: 'User reactivated' };
        } else {
          throw new NotFoundException('User not found');
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async delete(userId: number) {
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
