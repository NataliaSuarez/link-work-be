import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, FindOptionsWhere } from 'typeorm';

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
    return await this.userRepository.save(newUser);
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

  async update(id: number, changes: UpdateUserDto) {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    this.userRepository.merge(user, changes);
    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return this.userRepository.delete(id);
  }
}
