import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
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
import { Employer } from '../../users/entities/employer.entity';
import { StripeService } from '../../stripe/stripe.service';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
    @InjectRepository(Offers) private offerRepo: Repository<Offers>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
    @InjectRepository(Employer) private employerRepo: Repository<Employer>,
    private offerService: OffersService,
    private stripeService: StripeService,
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
    if (valid === false) {
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
