import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OffersService } from './offers.service';
import { Shift, ShiftStatus } from '../entities/shift.entity';

import { Clock } from '../entities/clock.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../users/entities/user.entity';
import { UserImage, ImageType } from '../../users/entities/user_image.entity';
import { isActiveByHours, isWaitingEnding } from '../../utils/dates';

@Injectable()
export class OptimizedShiftsService {
  constructor(
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
    @InjectRepository(Clock) private clocksRepo: Repository<Clock>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(UserImage) private imgRepo: Repository<UserImage>,
    private offersService: OffersService,
  ) {}

  /// WORKER
  async findNextShiftsByWorkerUserId(
    workerUserId: string,
    pagination?: PaginationDto,
  ) {
    try {
      const nextShifts = [];

      const shifts = await this.getShiftByWorker(workerUserId, pagination);

      for (const shift of shifts) {
        const formatShift = await this.getWorkerShiftDTO(shift, workerUserId);
        if (
          (formatShift.status == ShiftStatus.CREATED ||
            formatShift.status == ShiftStatus.ACTIVE ||
            formatShift.status == ShiftStatus.UNCONFIRMED) &&
          !(
            isActiveByHours(formatShift.offer.from, formatShift.offer.to) ||
            isWaitingEnding(formatShift)
          ) &&
          // is after today - next
          formatShift.offer.from > new Date(Date.now())
        ) {
          formatShift.status = parseInt(formatShift.status);
          nextShifts.push(formatShift);
        }
      }

      return nextShifts;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findActiveShiftsByWorkerUserId(
    workerUserId: string,
    pagination?: PaginationDto,
  ) {
    try {
      const activeShifts = [];
      const shifts = await this.getShiftByWorker(workerUserId, pagination);
      for (const shift of shifts) {
        const formatShift = await this.getWorkerShiftDTO(shift, workerUserId);
        if (
          (formatShift.status == ShiftStatus.CREATED ||
            formatShift.status == ShiftStatus.ACTIVE ||
            formatShift.status == ShiftStatus.UNCONFIRMED) &&
          (isActiveByHours(formatShift.offer.from, formatShift.offer.to) ||
            isWaitingEnding(formatShift))
        ) {
          formatShift.status = parseInt(formatShift.status);
          activeShifts.push(formatShift);
        }
      }

      return activeShifts;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // SHIFT REPOSITORY FUNCTION
  async getShiftByWorker(workerUserId: string, pagination?: PaginationDto) {
    try {
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
      return shifts;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // aux function DTO
  async getWorkerShiftDTO(shift, workerUserId) {
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
    return {
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
  }

  ////// EMPLOYER

  // SHIFT REPOSITORY FUNCTION
  async getShiftsByEmployer(
    employerUserId: string,
    pagination?: PaginationDto,
  ) {
    try {
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
      return shifts;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // SERVICE FUNCTION: NEXT SHIFT FOR EMPLOYER
  async findNextShiftsByEmployerUserId(
    employerUserId: string,
    pagination?: PaginationDto,
  ) {
    try {
      const acceptedShifts = [];

      const shifts = await this.getShiftsByEmployer(employerUserId, pagination);
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
        const formatShift = await this.getEmployerShiftDTO(shift, employerUser);
        if (
          (formatShift.status == ShiftStatus.CREATED ||
            formatShift.status == ShiftStatus.ACTIVE ||
            formatShift.status == ShiftStatus.UNCONFIRMED) &&
          !(
            // not is active shift
            (
              isActiveByHours(formatShift.offer.from, formatShift.offer.to) ||
              isWaitingEnding(formatShift)
            )
          ) &&
          // is after today - next
          formatShift.offer.from > new Date(Date.now())
        ) {
          formatShift.status = parseInt(formatShift.status);
          acceptedShifts.push(formatShift);
        }
      }

      return acceptedShifts;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // SERVICE FUNCTION: ACTIVE SHIFT FOR EMPLOYER
  async findActiveShiftsByEmployerUserId(
    employerUserId: string,
    pagination?: PaginationDto,
  ) {
    try {
      const activeShifts = [];

      const shifts = await this.getShiftsByEmployer(employerUserId, pagination);
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
        const formatShift = await this.getEmployerShiftDTO(shift, employerUser);
        if (
          (formatShift.status == ShiftStatus.CREATED ||
            formatShift.status == ShiftStatus.ACTIVE ||
            formatShift.status == ShiftStatus.UNCONFIRMED) &&
          // active shift
          (isActiveByHours(formatShift.offer.from, formatShift.offer.to) ||
            isWaitingEnding(formatShift))
        ) {
          formatShift.status = parseInt(formatShift.status);
          activeShifts.push(formatShift);
        }
      }

      return activeShifts;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // aux function DTO
  async getEmployerShiftDTO(shift, employerUser) {
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
    return {
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
  }
}
