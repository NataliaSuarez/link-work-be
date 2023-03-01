import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, FindOptionsWhere, LessThanOrEqual } from 'typeorm';

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
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Role, User } from '../../users/entities/user.entity';
import { UserImage, ImageType } from '../../users/entities/user_image.entity';
import { isActiveByHours, isWaitingEnding } from '../../utils/dates';
import { SendgridService } from '../../sendgrid/sendgrid.service';
import { FullNotificationDto } from '../../notify/dtos/notify.dto';
import { NotifyService } from '../../notify/services/notify.service';
@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
    @InjectRepository(Clock) private clocksRepo: Repository<Clock>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(UserImage) private imgRepo: Repository<UserImage>,
    private offersService: OffersService,
    private stripeService: StripeService,
    private sendgridService: SendgridService,
    private notificationService: NotifyService,
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

  async customFindById(id: string) {
    const shift = await this.shiftRepo.findOne({
      where: { id },
      relations: {
        workerUser: {
          workerData: true,
        },
        offer: {
          address: true,
          employerUser: true,
        },
      },
    });
    const employer = await this.usersRepo.findOne({
      where: {
        id: shift.offer.employerUser.id,
      },
      relations: {
        employerData: true,
      },
    });
    const profileImgUrl = await this.imgRepo.findOne({
      where: {
        type: ImageType.PROFILE_IMG,
        user: {
          id: shift.workerUser.id,
        },
      },
    });
    let profileImg;
    if (profileImgUrl) {
      profileImg = profileImgUrl.imgUrl;
    } else {
      profileImg = null;
    }
    const formatShift = {
      id: shift.id,
      clockIn: shift.clockIn,
      confirmedClockIn: shift.confirmedClockIn,
      clockOut: shift.clockOut,
      confirmedClockOut: shift.confirmedClockOut,
      status: shift.status,
      applicant: {
        id: shift.workerUser.id,
        firstName: shift.workerUser.firstName,
        lastName: shift.workerUser.lastName,
        stars: shift.workerUser.workerData.stars,
        totalReviews: shift.workerUser.workerData.totalReviews,
        profileUrl: profileImg,
      },
      offer: {
        id: shift.offer.id,
        title: shift.offer.title,
        from: shift.offer.from,
        to: shift.offer.to,
        usdHour: shift.offer.usdHour,
        createdAt: shift.offer.createAt,
        videoUrl: shift.offer.videoUrl,
        address: {
          id: shift.offer.address.id,
          address: shift.offer.address.address,
          city: shift.offer.address.city,
          state: shift.offer.address.state,
          postalCode: shift.offer.address.postalCode,
          lat: shift.offer.address.lat,
          long: shift.offer.address.long,
        },
        employerUser: {
          id: employer.id,
          userImages: shift.offer.employerUser.userImages,
          businessName: employer.employerData?.businessName,
          businessDescription: employer.employerData?.description,
        },
      },
    };
    return formatShift;
  }

  async findOneById(id: string): Promise<Shift> {
    const shift = await this.shiftRepo.findOne({
      where: { id },
      relations: {
        workerUser: {
          workerData: true,
        },
        offer: {
          address: true,
          employerUser: {
            employerData: true,
          },
        },
      },
    });

    return shift;
  }

  async findEndedShifts(
    userId: string,
    role: Role,
    pagination?: PaginationDto,
  ) {
    if (role === Role.WORKER) {
      const shifts = await this.findByWorkerUserId(userId, pagination);
      return shifts.doneShifts;
    } else if (role === Role.EMPLOYER) {
      const shifts = await this.findByEmployerUserId(userId, pagination);
      return shifts.doneShifts;
    }
  }

  async findByWorkerUserId(workerUserId: string, pagination?: PaginationDto) {
    try {
      const activeShifts = [];
      const acceptedShifts = [];
      const doneShifts = [];

      const shifts = await this.shiftRepo
        .createQueryBuilder('shifts')
        .leftJoinAndSelect('shifts.workerUser', 'applicant')
        .leftJoinAndSelect('applicant.workerData', 'worker')
        .leftJoinAndSelect('shifts.offer', 'offer')
        .leftJoinAndSelect('offer.address', 'address')
        .select([
          'shifts.id',
          'shifts.clockIn',
          'shifts.confirmedClockIn',
          'shifts.clockOut',
          'shifts.confirmedClockOut',
          'shifts.status',
          'applicant.id',
          'applicant.firstName',
          'applicant.lastName',
          'worker.stars',
          'worker.totalReviews',
          'offer.id',
          'offer.title',
          'offer.from',
          'offer.to',
          'offer.usdHour',
          'offer.createAt',
          'offer.videoUrl',
          'address.id',
          'address.address',
          'address.city',
          'address.state',
          'address.postalCode',
          'address.lat',
          'address.long',
        ])
        .where('shifts.workerUserId = :workerUserId', { workerUserId })
        .skip(pagination?.offset ?? 0)
        .take(pagination?.limit ?? 100)
        .getRawMany();

      for (const shift of shifts) {
        const offer = await this.offersService.findOneById(shift.offer_id);
        const employerUser = await this.usersRepo.findOne({
          where: {
            id: offer.employerUser.id,
          },
          relations: {
            userImages: true,
            employerData: true,
          },
        });
        const profileImgUrl = await this.imgRepo.findOne({
          where: {
            type: ImageType.PROFILE_IMG,
            user: {
              id: workerUserId,
            },
          },
        });
        let profileImg;
        if (profileImgUrl) {
          profileImg = profileImgUrl.imgUrl;
        } else {
          profileImg = null;
        }
        const formatShift = {
          id: shift.shifts_id,
          clockIn: shift.shifts_clockIn,
          confirmedClockIn: shift.shifts_confirmedClockIn,
          clockOut: shift.shifts_clockOut,
          confirmedClockOut: shift.shifts_confirmedClockOut,
          status: shift.shifts_status,
          applicant: {
            id: shift.applicant_id,
            firstName: shift.applicant_firstName,
            lastName: shift.applicant_lastName,
            stars: shift.worker_stars,
            totalReviews: shift.worker_totalReviews,
            profileUrl: profileImg,
          },
          offer: {
            id: shift.offer_id,
            title: shift.offer_title,
            from: shift.offer_from,
            to: shift.offer_to,
            usdHour: shift.offer_usdHour,
            createdAt: shift.offer_createAt,
            videoUrl: shift.offer_videoUrl,
            address: {
              id: shift.address_id,
              address: shift.address_address,
              city: shift.address_city,
              state: shift.address_state,
              postalCode: shift.address_postalCode,
              lat: shift.address_lat,
              long: shift.address_long,
            },
            employerUser: {
              id: employerUser.id,
              userImages: employerUser.userImages,
              businessName: employerUser.employerData.businessName,
              businessDescription: employerUser.employerData.description,
            },
          },
        };
        if (
          formatShift.status == ShiftStatus.CREATED ||
          formatShift.status == ShiftStatus.ACTIVE ||
          formatShift.status == ShiftStatus.UNCONFIRMED
        ) {
          if (
            isActiveByHours(formatShift.offer.from, formatShift.offer.to) ||
            isWaitingEnding(formatShift)
          ) {
            formatShift.status = parseInt(formatShift.status);
            activeShifts.push(formatShift);
          } else {
            formatShift.status = parseInt(formatShift.status);
            acceptedShifts.push(formatShift);
          }
        } else {
          formatShift.status = parseInt(formatShift.status);
          doneShifts.push(formatShift);
        }
      }

      return {
        activeShifts: activeShifts,
        acceptedShifts: acceptedShifts,
        doneShifts: doneShifts,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findByEmployerUserId(
    employerUserId: string,
    pagination?: PaginationDto,
  ) {
    try {
      const activeShifts = [];
      const acceptedShifts = [];
      const doneShifts = [];

      const shifts = await this.shiftRepo
        .createQueryBuilder('shifts')
        .leftJoinAndSelect('shifts.workerUser', 'applicant')
        .leftJoinAndSelect('applicant.workerData', 'worker')
        .leftJoinAndSelect('shifts.offer', 'offer')
        .leftJoinAndSelect('offer.address', 'address')
        .select([
          'shifts.id',
          'shifts.clockIn',
          'shifts.confirmedClockIn',
          'shifts.clockOut',
          'shifts.confirmedClockOut',
          'shifts.status',
          'applicant.id',
          'applicant.firstName',
          'applicant.lastName',
          'worker.stars',
          'worker.totalReviews',
          'offer.id',
          'offer.title',
          'offer.from',
          'offer.to',
          'offer.usdHour',
          'offer.createAt',
          'offer.videoUrl',
          'address.id',
          'address.address',
          'address.city',
          'address.state',
          'address.postalCode',
          'address.lat',
          'address.long',
        ])
        .where(
          'shifts.offerId in (select id from offers where "employerUserId" = :employerUserId)',
          { employerUserId },
        )
        .skip(pagination?.offset ?? 0)
        .take(pagination?.limit ?? 100)
        .getRawMany();

      const employerUser = await this.usersRepo.findOne({
        where: {
          id: employerUserId,
        },
        relations: {
          userImages: true,
          employerData: true,
        },
      });

      for (const shift of shifts) {
        const profileImgUrl = await this.imgRepo.findOne({
          where: {
            type: ImageType.PROFILE_IMG,
            user: {
              id: shift.applicant_id,
            },
          },
        });
        let profileImg;
        if (profileImgUrl) {
          profileImg = profileImgUrl.imgUrl;
        } else {
          profileImg = null;
        }
        const formatShift = {
          id: shift.shifts_id,
          clockIn: shift.shifts_clockIn,
          confirmedClockIn: shift.shifts_confirmedClockIn,
          clockOut: shift.shifts_clockOut,
          confirmedClockOut: shift.shifts_confirmedClockOut,
          status: shift.shifts_status,
          applicant: {
            id: shift.applicant_id,
            firstName: shift.applicant_firstName,
            lastName: shift.applicant_lastName,
            stars: shift.worker_stars,
            totalReviews: shift.worker_totalReviews,
            profileUrl: profileImg,
          },
          offer: {
            id: shift.offer_id,
            title: shift.offer_title,
            from: shift.offer_from,
            to: shift.offer_to,
            usdHour: shift.offer_usdHour,
            createdAt: shift.offer_createAt,
            videoUrl: shift.offer_videoUrl,
            address: {
              id: shift.address_id,
              address: shift.address_address,
              city: shift.address_city,
              state: shift.address_state,
              postalCode: shift.address_postalCode,
              lat: shift.address_lat,
              long: shift.address_long,
            },
            employerUser: {
              id: employerUser.id,
              userImages: employerUser.userImages,
              businessName: employerUser.employerData.businessName,
              businessDescription: employerUser.employerData.description,
            },
          },
        };
        if (
          formatShift.status == ShiftStatus.CREATED ||
          formatShift.status == ShiftStatus.ACTIVE ||
          formatShift.status == ShiftStatus.UNCONFIRMED
        ) {
          if (
            isActiveByHours(formatShift.offer.from, formatShift.offer.to) ||
            isWaitingEnding(formatShift)
          ) {
            formatShift.status = parseInt(formatShift.status);
            activeShifts.push(formatShift);
          } else {
            formatShift.status = parseInt(formatShift.status);
            acceptedShifts.push(formatShift);
          }
        } else {
          formatShift.status = parseInt(formatShift.status);
          doneShifts.push(formatShift);
        }
      }

      return {
        activeShifts: activeShifts,
        acceptedShifts: acceptedShifts,
        doneShifts: doneShifts,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
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
      await this.sendgridService.send({
        to: employer.email,
        from: 'LinkWork Team <matias.viano@getwonder.tech>',
        templateId: 'd-fd07b18729124e7bb6554193148649ca',
        dynamicTemplateData: {
          subject_msg: `Your payment has been taken`,
          message_body: `A total of ${offer.usdTotal} usd has been taken for the payment of your job offer ${offer.title}`,
          second_body: `The money will not be sent to ${workerUser.firstName} ${workerUser.lastName} until the end of the shift`,
        },
      });
      const savedOffer = await this.offersService.updateStatus(
        offerId,
        OfferStatus.ACCEPTED,
      );
      const newShift = this.shiftRepo.create();
      newShift.workerUser = workerUser;
      newShift.offer = savedOffer;
      const savedShift = await this.shiftRepo.save(newShift);
      if (workerUser.fcmIdentityToken) {
        const notification: FullNotificationDto = {
          data: {
            entityId: offer.id,
            path: '/offer-details-view',
            argsType: '0',
            redirect: 'true',
          },
          notification: {
            title: 'You have been accepted',
            body: 'You have a new shift for the offer ' + offer.title,
          },
          token: workerUser.fcmIdentityToken,
          android: {
            priority: 'high',
          },
          apns: {
            payload: {
              aps: {
                contentAvailable: true,
              },
            },
            headers: {
              'apns-push-type': 'background',
              'apns-priority': '5',
              'apns-topic': 'io.flutter.plugins.firebase.messaging',
            },
          },
        };
        this.notificationService.sendNotification(notification);
      }
      offer.applicants.forEach(async (applicant) => {
        if (applicant.id === workerUserId) {
          await this.sendgridService.send({
            to: workerUser.email,
            from: 'LinkWork Team <matias.viano@getwonder.tech>',
            templateId: 'd-fd07b18729124e7bb6554193148649ca',
            dynamicTemplateData: {
              subject_msg: `Congratulations! You have been accepted on a job offer`,
              message_body: `You have been accepted in the job offer ${offer.title}`,
              second_body: `Remember that the shift go from ${offer.from} to ${offer.to}`,
            },
          });
        } else {
          await this.sendgridService.send({
            to: applicant.email,
            from: 'LinkWork Team <matias.viano@getwonder.tech>',
            templateId: 'd-fd07b18729124e7bb6554193148649ca',
            dynamicTemplateData: {
              subject_msg: `Unfortunately you have not been selected`,
              message_body: `Another candidate has been accepted for the job offer ${offer.title}`,
              second_body: `Don't let this discourage you and keep applying to other available offers`,
            },
          });
        }
        await this.offersService.removeApplicant(
          offer.id,
          applicant.id,
          employerUserId,
        );
      });
      const updatedOffer = await this.offersService.findOneById(offerId, {
        favoritedBy: true,
      });
      if (updatedOffer.favoritedBy.length > 0) {
        updatedOffer.favoritedBy.forEach(async (user) => {
          if (user.id != workerUserId) {
            await this.sendgridService.send({
              to: user.email,
              from: 'LinkWork Team <matias.viano@getwonder.tech>',
              templateId: 'd-fd07b18729124e7bb6554193148649ca',
              dynamicTemplateData: {
                subject_msg: `An offer that you have in favorite has been closed`,
                message_body: `Another candidate has been accepted for the job offer ${offer.title}`,
                second_body: `Don't let this discourage you and keep applying to other available offers`,
              },
            });
          }
        });
      }
      return savedShift;
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
        await this.sendgridService.send({
          to: shift.workerUser.email,
          from: 'LinkWork Team <matias.viano@getwonder.tech>',
          templateId: 'd-fd07b18729124e7bb6554193148649ca',
          dynamicTemplateData: {
            subject_msg: `We have sent a payment to your bank account`,
            message_body: `A payment of ${shift.offer.usdTotal} usd has been sent for the job offer ${shift.offer.title}`,
            second_body: `Check it out in your bank account`,
          },
        });
        await this.sendgridService.send({
          to: shift.offer.employerUser.email,
          from: 'LinkWork Team <matias.viano@getwonder.tech>',
          templateId: 'd-fd07b18729124e7bb6554193148649ca',
          dynamicTemplateData: {
            subject_msg: `We have sent a payment for your job offer`,
            message_body: `We have sent a payment to ${shift.workerUser.firstName} ${shift.workerUser.lastName} for the job offer ${shift.offer.title}`,
            second_body: `We hope you had a good experience`,
          },
        });
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
