import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Equal,
  FindOptionsWhere,
  LessThanOrEqual,
  FindOptionsRelations,
} from 'typeorm';

import { OfferStatus } from '../entities/offer.entity';
import { OffersService } from './offers.service';
import { Shift, ShiftStatus } from '../entities/shift.entity';
import {
  CreateShiftDto,
  FilterShiftsDto,
  UpdateShiftDto,
} from '../dtos/shift.dto';
import { StripeService } from '../../stripe/stripe.service';
import { Clock } from '../entities/clock.entity';
import * as moment from 'moment';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
    @InjectRepository(Clock) private clocksRepo: Repository<Clock>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private offersService: OffersService,
    private stripeService: StripeService,
  ) {}

  async findByStatus(reqUserId: string, status: ShiftStatus) {
    const shifts = await this.shiftRepo.find({
      relations: {
        offer: { employerUser: true },
        workerUser: true,
      },
      where: [
        {
          status: status,
          offer: {
            employerUser: {
              id: reqUserId,
            },
          },
        },
        {
          status: status,
          workerUser: { id: reqUserId },
        },
      ],
    });

    return shifts;
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
          relations: { offer: true, workerUser: true },
        });
      }
      return await this.shiftRepo.find();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async findOneById(
    id: string,
    relations?: FindOptionsRelations<Shift>,
  ): Promise<Shift> {
    const shift = await this.shiftRepo.findOne({
      where: { id },
      relations,
    });
    return shift;
  }

  async findByWorkerUserId(workerUserId: string, pagination?: PaginationDto) {
    let shifts: { activeShifts: Shift[]; acceptedShifts: Shift[] };
    try {
      const activeShifts = await this.shiftRepo.find({
        relations: {
          offer: true,
          workerUser: true,
        },
        where: {
          workerUser: {
            id: workerUserId,
          },
          status: ShiftStatus.ACTIVE,
        },
        skip: pagination.offset,
        take: pagination.limit,
      });
      const acceptedShifts = await this.shiftRepo.find({
        relations: {
          offer: true,
          workerUser: true,
        },
        where: {
          workerUser: {
            id: workerUserId,
          },
          status: ShiftStatus.CREATED,
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

  async findByEmployerUserId(
    employerUserId: string,
    pagination?: PaginationDto,
  ) {
    try {
      const activeShifts = [];
      const acceptedShifts = [];

      const shifts = await this.shiftRepo.find({
        relations: {
          offer: { employerUser: true },
          workerUser: { userImages: true },
        },
        where: {
          offer: {
            employerUser: { id: employerUserId },
          },
        },
        select: {
          id: true,
          createAt: true,
          updateAt: true,
          clockIn: true,
          clockOut: true,
          status: true,
        },
        skip: pagination?.offset ?? 0,
        take: pagination?.limit ?? 100,
      });
      for (const shift of shifts) {
        if (shift.status === ShiftStatus.CREATED) {
          acceptedShifts.push(shift);
        } else if (shift.status === ShiftStatus.ACTIVE) {
          activeShifts.push(shift);
        }
      }

      return {
        activeShifts: activeShifts,
        acceptedShifts: acceptedShifts,
      };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async create(
    { workerUserId, offerId }: CreateShiftDto,
    employerUserId: string,
  ) {
    const offer = await this.offersService.findOneById(offerId, {
      employerUser: { employerData: true },
      applicants: true,
    });
    if (!offer || offer.employerUser.id !== employerUserId) {
      throw new NotFoundException(`Offer not found`);
    }
    const workerUser = offer.applicants.find(
      (applicant) => applicant.id === workerUserId,
    );
    if (!workerUser) {
      throw new ConflictException(`Worker didn't apply to the offer`);
    }
    const employer = await this.usersRepo.findOne({
      where: {
        id: employerUserId,
      },
      relations: { employerData: true },
    });
    const valid = await this.offersService.validWorkerForShift(
      workerUser,
      offer.from,
      offer.to,
    );
    if (!valid) {
      throw new ConflictException(`Worker reached max hours for this week`);
    }
    const employerStripeCustomerId = employer.employerData.customerId;
    const paymentMethod = await this.stripeService.retrievePaymentMethod(
      employerStripeCustomerId,
    );
    const amount = offer.usdTotal * 100;
    const paymentData = {
      amount: amount,
      currency: 'usd',
      customer: employerStripeCustomerId,
      description: offer.title,
      payment_method: paymentMethod.data[0].id,
      confirm: true,
    };
    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(
        paymentData,
      );
      if (paymentIntent.status != 'succeeded') {
        throw new ConflictException('Payment intent unsuccessful');
      }
      const savedOffer = await this.offersService.updateStatus(
        offerId,
        OfferStatus.ACCEPTED,
      );
      const newShift = this.shiftRepo.create();
      newShift.workerUser = workerUser;
      newShift.offer = savedOffer;
      return await this.shiftRepo.save(newShift);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async clockInByEmployer(shift: Shift) {
    if (shift.offer.from > new Date()) {
      throw new ConflictException('Shift has not started yet');
    }
    if (shift.offer.to < new Date()) {
      throw new ConflictException('Shift already ended');
    }
    try {
      shift.clockIn = true;
      const clockHistory = {
        clockType: 1,
        shift: shift,
        user: shift.offer.employerUser,
      };
      const newClock = this.clocksRepo.create(clockHistory);
      await this.clocksRepo.save(newClock);
      return await this.shiftRepo.save(shift);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async clockInByWorker(shift: Shift) {
    if (!shift.clockIn) {
      throw new BadRequestException(`Clock-in pending by Employer`);
    }
    try {
      shift.confirmedClockIn = true;
      shift.status = 1;
      const clockHistory = {
        clockType: 1,
        shift: shift,
        user: shift.workerUser,
      };
      const newClock = this.clocksRepo.create(clockHistory);
      await this.clocksRepo.save(newClock);
      return await this.shiftRepo.save(shift);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async clockOutByWorker(shift: Shift) {
    if (!shift.confirmedClockIn) {
      throw new BadRequestException(`Clock-in confirmation pending`);
    }
    try {
      shift.clockOut = true;
      const date = new Date(moment().add(1, 'd').format());
      shift.autoConfirmed = date;
      shift.status = 4;
      const clockHistory = {
        clockType: 2,
        shift: shift,
        user: shift.workerUser,
      };
      const newClock = this.clocksRepo.create(clockHistory);
      await this.clocksRepo.save(newClock);
      return await this.shiftRepo.save(shift);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async confirmShift(shift: Shift) {
    try {
      if (!shift.clockOut) {
        throw new BadRequestException(`Clock-out pending by Worker`);
      }
      const workerUserStripeId = shift.workerUser.workerData.stripeId;
      if (!workerUserStripeId) {
        throw new BadRequestException(
          `Error Worker user ID ${shift.workerUser.id} has not payment stripe ID`,
        );
      }
      const amount = shift.offer.usdTotal * 100;
      const description = shift.offer.title + shift.offer.from + shift.offer.to;
      const transferData = {
        amount: amount,
        currency: 'usd',
        destination: workerUserStripeId,
        description: description,
      };
      const transfer = await this.stripeService.createTransfer(transferData);
      if (transfer.created) {
        await this.offersService.updateStatus(shift.offer.id, OfferStatus.DONE);
        const clockHistory = {
          clockType: 2,
          shift: shift,
          user: shift.offer.employerUser,
        };
        const newClock = this.clocksRepo.create(clockHistory);
        await this.clocksRepo.save(newClock);
        return await this.update(shift, {
          status: ShiftStatus.DONE,
          confirmedClockOut: true,
        });
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(`Error with shift confirmation`);
    }
  }

  async autoConfirmShifts() {
    const date = new Date();
    const shifts = await this.shiftRepo.find({
      where: {
        status: ShiftStatus.UNCONFIRMED,
        autoConfirmed: LessThanOrEqual(date),
      },
      relations: { workerUser: { workerData: true } },
    });
    if (shifts.length > 0) {
      for (const shift of shifts) {
        try {
          const amount = shift.offer.usdTotal * 100;
          const description =
            shift.offer.title + shift.offer.from + shift.offer.to;
          const transferData = {
            amount: amount,
            currency: 'usd',
            destination: shift.workerUser.workerData.stripeId,
            description: description,
          };
          const transfer = await this.stripeService.createTransfer(
            transferData,
          );
          if (transfer.created) {
            await this.update(shift, { status: ShiftStatus.DONE });
            await this.offersService.updateStatus(
              shift.offer.id,
              OfferStatus.DONE,
            );
          }
        } catch (error) {
          throw new ConflictException(
            `Error with shift id #${shift.id} auto-confirmation`,
          );
        }
      }
    }
  }

  async remove(id: string) {
    try {
      await this.shiftRepo.delete(id);
      return { message: 'Shift removed' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async update(shift: Shift, changes: UpdateShiftDto) {
    try {
      this.shiftRepo.merge(shift, changes);
      return await this.shiftRepo.save(shift);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
