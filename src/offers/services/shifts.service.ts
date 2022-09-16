import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, FindOptionsWhere } from 'typeorm';

import { Offers } from '../entities/offers.entity';
import { OffersService } from './offers.service';
import { Worker } from '../../users/entities/worker.entity';
import { Shift } from '../entities/shift.entity';
import {
  CreateShiftDto,
  FilterShiftsDto,
  UpdateShiftDto,
} from '../dtos/shift.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
    @InjectRepository(Offers) private offerRepo: Repository<Offers>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
    private offerService: OffersService,
  ) {}

  findAll(params?: FilterShiftsDto) {
    if (params) {
      const where: FindOptionsWhere<Shift> = {};
      const { limit, offset } = params;
      const { status } = params;
      if (status) {
        where.status = Equal(status);
      }
      return this.shiftRepo.find({
        where,
        take: limit,
        skip: offset,
        relations: ['offer', 'worker'],
      });
    }
    return this.shiftRepo.find();
  }

  async findOne(id: number): Promise<Shift> {
    const shift = await this.shiftRepo.findOne({
      where: { id: id },
      relations: ['offer', 'worker'],
    });
    if (!shift) {
      throw new NotFoundException(`Shift #${id} not found`);
    }
    return shift;
  }

  async findByWorker(workerId: number) {
    const activeShifts = await this.shiftRepo.find({
      relations: {
        offer: true,
        worker: true,
      },
      where: {
        worker: {
          id: workerId,
        },
        status: 1,
      },
    });
    const acceptedShifts = await this.shiftRepo.find({
      relations: {
        offer: true,
        worker: true,
      },
      where: {
        worker: {
          id: workerId,
        },
        status: 0,
      },
    });

    const shifts = {
      activeShifts: activeShifts,
      acceptedShifts: acceptedShifts,
    };
    return shifts;
  }

  async findByEmployer(employerId: number) {
    const offers = await this.offerService.findByEmployer(employerId);
    const activeShifts = [];
    const acceptedShifts = [];

    for (const object of offers) {
      const shift = await this.shiftRepo.find({
        relations: {
          offer: true,
          worker: true,
        },
        where: {
          offer: {
            id: object.id,
          },
        },
      });
      if (shift[0]) {
        if (shift[0].status === 0) {
          acceptedShifts.push(shift);
        } else if (shift[0].status === 1) {
          activeShifts.push(shift);
        }
      }
    }

    const shifts = {
      activeShifts: activeShifts,
      acceptedShifts: acceptedShifts,
    };
    return shifts;
  }

  async create(data: CreateShiftDto) {
    const offer = await this.offerRepo.findOneBy({
      id: data.offerId,
    });
    const worker = await this.workerRepo.findOneBy({
      id: data.workerId,
    });
    const applicants = await this.offerService.findApplicants(data.offerId);
    if (!offer) {
      throw new NotFoundException(`Offer #${data.offerId} not found`);
    }
    if (!worker) {
      throw new NotFoundException(`Worker #${data.workerId} not found`);
    }
    let aux = 0;
    for (const object of applicants) {
      if (object.id === worker.id) {
        aux = 1;
      }
    }
    if (aux != 1) {
      throw new NotFoundException(
        `Worker #${worker.id} is not an applicant of this offer`,
      );
    }
    this.offerService.update(data.offerId, { status: 1 });
    this.offerService.removeApplicant(data.offerId, data.workerId);
    const newShift = this.shiftRepo.create(data);
    newShift.worker = worker;
    newShift.offer = offer;
    return this.shiftRepo.save(newShift);
  }

  remove(id: number) {
    return this.shiftRepo.delete(id);
  }

  async update(id: number, changes: UpdateShiftDto) {
    const shift = await this.shiftRepo.findOneBy({ id: id });
    if (!shift) {
      throw new NotFoundException(`Shift #${id} not found`);
    }
    this.shiftRepo.merge(shift, changes);
    return this.shiftRepo.save(shift);
  }
}
