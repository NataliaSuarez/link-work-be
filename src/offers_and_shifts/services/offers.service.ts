import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Equal,
  FindOptionsWhere,
  FindOptionsRelations,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  In,
} from 'typeorm';
import * as moment from 'moment';

import {
  CreateOfferDto,
  FilterOffersDto,
  UpdateOfferDto,
} from '../dtos/offers.dto';
import { Offer, OfferStatus } from '../entities/offer.entity';
import { Shift, ShiftStatus } from '../entities/shift.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DOSpacesService } from '../../spaces/services/doSpacesService';
import { Role, User } from 'src/users/entities/user.entity';
import { Address } from '../../users/entities/address.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Shift) private shiftsRepo: Repository<Shift>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
    private doSpaceService: DOSpacesService,
  ) {}

  async findAllFiltered(params?: FilterOffersDto) {
    if (params) {
      const where: FindOptionsWhere<Offer> = {};
      const { limit, offset } = params;
      const { usdHour, status } = params;
      if (usdHour) {
        where.usdHour = Equal(usdHour);
      }
      if (status) {
        where.status = Equal(status);
      }
      return await this.offersRepo.find({
        where,
        take: limit,
        skip: offset,
        loadEagerRelations: false,
        loadRelationIds: { relations: ['employerUser'] },
      });
    } else {
      return await this.offersRepo.find();
    }
  }

  async findOneById(
    id: string,
    relations?: FindOptionsRelations<Offer>,
  ): Promise<Offer> {
    const offer = await this.offersRepo.findOne({
      where: { id },
      relations,
    });
    return offer;
  }

  async findAllByEmployerUserId(employerUserId: string) {
    const offers = await this.offersRepo.find({
      where: { employerUser: { id: employerUserId } },
      loadEagerRelations: false,
    });
    return offers;
  }

  async findByEmployerUserId(
    employerUserId: string,
    pagination?: PaginationDto,
  ): Promise<Offer[]> {
    const offers = await this.offersRepo.find({
      where: {
        employerUser: {
          id: employerUserId,
        },
      },
      skip: pagination.offset,
      take: pagination.limit,
    });
    return offers;
  }

  async create(data: CreateOfferDto, employerUserId: string) {
    if (moment(data.from) < moment().add(2, 'hours')) {
      throw new BadRequestException(
        'Offer starting time has to be atleast 2 hours from now',
      );
    }
    const datesHoursDiff = moment(data.to).diff(data.from, 'hours');
    if (datesHoursDiff < 0.5 || datesHoursDiff > 16) {
      throw new BadRequestException(
        'Offer time cannot be less than 30 minutes or longer than 16 hours',
      );
    }
    const { addressId } = data;
    const address = await this.addressRepo.findBy({ id: addressId });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    try {
      const newOffer = this.offersRepo.create({
        ...data,
        employerUser: { id: employerUserId },
        address: { id: addressId },
      });
      return await this.offersRepo.save(newOffer);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.response.message);
    }
  }

  async uploadOfferVideo(offer: Offer, file: Express.Multer.File) {
    try {
      const fileUrl = await this.doSpaceService.uploadOfferVideo(
        file,
        offer.employerUser.id,
        offer.id,
      );

      offer.videoUrl = fileUrl;
      return await this.offersRepo.save(offer);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getDownloadFileUrl(offer: Offer) {
    try {
      const url = await this.doSpaceService.downloadFile(offer.videoUrl);
      return url;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string) {
    try {
      await this.offersRepo.delete(id);
      return { message: 'Offer removed' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async edit(offer: Offer, changes: UpdateOfferDto) {
    if (offer.status !== OfferStatus.CREATED) {
      throw new ForbiddenException('Cannot edit an accepted or done offer');
    }
    if (offer.applicants.length > 0) {
      throw new ForbiddenException('Cannot edit an offer with applicants');
    }
    try {
      this.offersRepo.merge(offer, changes);
      return await this.offersRepo.save(offer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async updateStatus(offer: Offer, status: OfferStatus) {
    try {
      offer.status = status;
      return await this.offersRepo.save(offer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async removeApplicant(offerId: string, applicantUserId: string) {
    const offer = await this.findOneById(offerId, { applicants: true });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    offer.applicants = offer.applicants.filter(
      (applicant) => applicant.id != applicantUserId,
    );
    offer.applicantsCount -= 1;
    try {
      await this.offersRepo.save(offer);
      return { message: 'Applicant removed from offer' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async apply(workerUserId: string, offer: Offer) {
    const workerUser = await this.usersRepo.findOneBy({
      id: workerUserId,
      role: Role.WORKER,
    });
    if (!workerUser) {
      throw new ForbiddenException('Only workers can apply');
    }
    if (!workerUser.workerData?.stripeId) {
      throw new ConflictException(`Worker doesn't have a payment method set`);
    }

    // Reject application if offer starts in less than 15 minutes or if it was already accepted
    if (
      offer.status !== OfferStatus.CREATED ||
      moment(offer.from).diff(moment(), 'minutes') < 15
    ) {
      throw new ConflictException('Offer cannot be applied to anymore');
    }

    // Check if worker already applied
    if (offer.applicants.find((applicant) => applicant.id === workerUserId)) {
      throw new ConflictException('Worker already applied');
    }

    // Check if worker already has an accepted offer
    const valid = await this.validWorkerForShift(
      workerUser,
      offer.from,
      offer.to,
    );
    if (!valid) {
      throw new ConflictException(
        `Worker reached max hours for this week or has a shift in this time`,
      );
    }
    offer.applicants.push(workerUser);
    offer.applicantsCount += 1;
    try {
      await this.offersRepo.save(offer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async validWorkerForShift(
    workerUser: User,
    offerFrom: Date,
    offerTo: Date,
  ): Promise<boolean> {
    try {
      // check if worker has a shift in the offer time
      const shift = await this.shiftsRepo.findOne({
        where: {
          workerUser: { id: workerUser.id },
          offer: {
            from: LessThanOrEqual(offerTo),
            to: MoreThanOrEqual(offerFrom),
          },
          status: Not(In([ShiftStatus.CANCELED, ShiftStatus.DONE])),
        },
      });
      if (shift) {
        return false;
      }

      // check if worker has reached max hours for the week
      const weekStartDate = moment(offerFrom).startOf('isoWeek').toDate();
      const weekEndDate = moment(offerFrom).endOf('isoWeek').toDate();

      const shifts = await this.shiftsRepo.find({
        where: {
          workerUser: { id: workerUser.id },
          offer: { from: Between(weekStartDate, weekEndDate) },
        },
      });
      const hours = shifts.reduce((acc, shift) => {
        const duration = moment(shift.offer.to).diff(shift.offer.from, 'hours');
        return acc + duration;
      }, 0);

      return hours < 40;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
