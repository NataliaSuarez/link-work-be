import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, FindOptionsWhere, LessThanOrEqual } from 'typeorm';

import { Offers } from '../entities/offers.entity';
import { OffersService } from './offers.service';
import { Worker } from '../../users/entities/worker.entity';
import { Users } from '../../users/entities/users.entity';
import { Shift } from '../entities/shift.entity';
import {
  CreateShiftDto,
  FilterShiftsDto,
  UpdateShiftDto,
} from '../dtos/shift.dto';
import { Employer } from '../../users/entities/employer.entity';
import { StripeService } from '../../stripe/stripe.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
    @InjectRepository(Offers) private offerRepo: Repository<Offers>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
    @InjectRepository(Employer) private employerRepo: Repository<Employer>,
    @InjectRepository(Users) private userRepo: Repository<Users>,
    private offerService: OffersService,
    private stripeService: StripeService,
  ) {}

  async findShifts(data) {
    const user = await this.userRepo.findOne({
      where: { email: data.email },
      relations: ['employer', 'worker'],
    });
    if (!user) {
      throw new NotFoundException(`User ${data.email} not found`);
    }
    if (user.role === 1) {
      if (!user.employer) {
        throw new NotFoundException(
          `User ${data.email} employer profile not found`,
        );
      }
      return this.findByEmployer(user.employer.id);
    } else if (user.role === 2) {
      if (!user.worker) {
        throw new NotFoundException(
          `User ${data.email} worker profile not found`,
        );
      }
      return this.findByWorker(user.worker.id);
    }
  }

  async findAllFiltered(params?: FilterShiftsDto) {
    try {
      if (params) {
        const where: FindOptionsWhere<Shift> = {};
        const { limit, offset } = params;
        const { status } = params;
        if (status) {
          where.status = Equal(status);
        }
        return await this.shiftRepo.find({
          where,
          take: limit,
          skip: offset,
          relations: ['offer', 'worker'],
        });
      }
      return await this.shiftRepo.find();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findOneById(id: number): Promise<Shift> {
    let shift: Shift;
    try {
      shift = await this.shiftRepo.findOne({
        where: { id: id },
        relations: ['offer', 'worker'],
      });
    } catch (error) {
      throw error;
    }
    if (!shift) {
      throw new NotFoundException(`Shift #${id} not found`);
    }
    return shift;
  }

  async findByWorker(workerId: number, pagination?: PaginationDto) {
    let shifts: { activeShifts: Shift[]; acceptedShifts: Shift[] };
    try {
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
        skip: pagination.offset,
        take: pagination.limit,
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
        skip: pagination.offset,
        take: pagination.limit,
      });

      shifts = {
        activeShifts: activeShifts,
        acceptedShifts: acceptedShifts,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
    return shifts;
  }

  async findByEmployer(employerId: number, pagination?: PaginationDto) {
    let shifts: { activeShifts: Shift[]; acceptedShifts: Shift[] };

    try {
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
          skip: pagination.offset,
          take: pagination.limit,
        });
        if (shift[0]) {
          if (shift[0].status === 0) {
            acceptedShifts.push(shift);
          } else if (shift[0].status === 1) {
            activeShifts.push(shift);
          }
        }
      }

      shifts = {
        activeShifts: activeShifts,
        acceptedShifts: acceptedShifts,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
    return shifts;
  }

  async create(data: CreateShiftDto) {
    const offer = await this.offerRepo.findOne({
      relations: {
        employer: true,
      },
      where: {
        id: data.offerId,
      },
    });
    const worker = await this.workerRepo.findOneBy({
      id: data.workerId,
    });
    if (!offer) {
      throw new NotFoundException(`Offer #${data.offerId} not found`);
    }
    const employer = await this.employerRepo.findOneBy({
      id: offer.employer.id,
    });
    const applicants = await this.offerService.findApplicants(data.offerId);
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
    const valid = await this.offerService.validWorkerForShift(
      worker.id,
      offer.from,
      offer.to,
    );
    if (!valid) {
      throw new ForbiddenException(
        `Worker #${worker.id} is full of shift hours at this week`,
      );
    }
    const paymentMethod = await this.stripeService.retrievePaymentMethod(
      employer.customerId,
    );
    const amount = offer.usdTotal * 100;
    const paymentData = {
      amount: amount,
      currency: 'usd',
      customer: employer.customerId,
      description: offer.title,
      payment_method: paymentMethod.data[0].id,
      confirm: true,
    };
    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(
        paymentData,
      );
      if (paymentIntent.status != 'succeeded') {
        throw new ConflictException('Payment intent not succeeded');
      }
      this.offerService.update(data.offerId, { status: 1 });
      this.offerService.removeApplicant(data.offerId, data.workerId);
      const newShift = this.shiftRepo.create(data);
      newShift.worker = worker;
      newShift.offer = offer;
      return this.shiftRepo.save(newShift);
    } catch (error) {
      throw new ConflictException('Error with payment intent');
    }
  }

  async clockInByEmployer(id: number) {
    const shift = await this.shiftRepo.findOneBy({ id: id });
    if (!shift) {
      throw new NotFoundException(`Shift #${id} not found`);
    }
    shift.clockIn = true;
    return this.shiftRepo.save(shift);
  }

  async clockInByWorker(id: number) {
    const shift = await this.shiftRepo.findOneBy({ id: id });
    if (!shift) {
      throw new NotFoundException(`Shift #${id} not found`);
    }
    if (!shift.clockIn) {
      throw new BadRequestException(
        `Shift #${id} need clock in request by Employer`,
      );
    }
    shift.confirmedClockIn = true;
    return this.shiftRepo.save(shift);
  }

  async clockOutByWorker(id: number) {
    const shift = await this.shiftRepo.findOneBy({ id: id });
    if (!shift) {
      throw new NotFoundException(`Shift #${id} not found`);
    }
    if (!shift.confirmedClockIn) {
      throw new BadRequestException(`Shift #${id} need clock in confirm`);
    }
    shift.clockOut = true;
    return this.shiftRepo.save(shift);
  }

  async confirmShift(id: number) {
    try {
      const shift = await this.shiftRepo.findOneBy({ id: id });
      if (!shift) {
        throw new NotFoundException(`Shift #${id} not found`);
      }
      if (!shift.clockOut) {
        throw new BadRequestException(
          `Shift #${id} need clock out request by Worker`,
        );
      }
      const amount = shift.offer.usdTotal * 100;
      const description = shift.offer.title + shift.offer.from + shift.offer.to;
      const transferData = {
        amount: amount,
        currency: 'usd',
        destination: shift.worker.stripeId,
        description: description,
      };
      const transfer = await this.stripeService.createTransfer(transferData);
      if (transfer.created) {
        await this.offerService.update(shift.offer.id, { status: 2 });
        return await this.update(shift.id, {
          status: 2,
          confirmedClockOut: true,
        });
      }
    } catch (error) {
      console.log(error);
      throw new ConflictException(`Error with shift id #${id} confirmation`);
    }
  }

  async autoConfirmShifts() {
    const date = new Date();
    const shifts = await this.shiftRepo.find({
      where: {
        status: 4,
        autoConfirmed: LessThanOrEqual(date),
      },
      relations: ['worker'],
    });
    if (shifts.length > 0) {
      for (const obj of shifts) {
        try {
          const amount = obj.offer.usdTotal * 100;
          const description = obj.offer.title + obj.offer.from + obj.offer.to;
          const transferData = {
            amount: amount,
            currency: 'usd',
            destination: obj.worker.stripeId,
            description: description,
          };
          const transfer = await this.stripeService.createTransfer(
            transferData,
          );
          if (transfer.created) {
            await this.update(obj.id, { status: 2 });
            await this.offerService.update(obj.offer.id, { status: 2 });
            console.log(transferData);
          }
        } catch (error) {
          console.log(error);
          throw new ConflictException(
            `Error with shift id #${obj.id} auto-confirmation`,
          );
        }
      }
    } else {
      console.log('Nothing to confirm');
    }
  }

  async remove(id: number) {
    try {
      await this.shiftRepo.delete(id);
      return { message: 'Shift removed' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async update(id: number, changes: UpdateShiftDto) {
    const shift = await this.shiftRepo.findOneBy({ id: id });
    if (!shift) {
      throw new NotFoundException(`Shift #${id} not found`);
    }
    try {
      this.shiftRepo.merge(shift, changes);
      return await this.shiftRepo.save(shift);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
