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
import { PaginationDto } from '../../common/dto/pagination.dto';
import { DOSpacesService } from '../../spaces/services/doSpacesService';
import { Role, User } from '../../users/entities/user.entity';
import { Address } from '../../users/entities/address.entity';
import { WorkersService } from '../../users/services/workers.service';
import { EmployerData } from '../../users/entities/employer_data.entity';
import { StripeService } from '../../stripe/stripe.service';
import { getHoursDiff } from '../../utils/dates';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private offersRepo: Repository<Offer>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Shift) private shiftsRepo: Repository<Shift>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
    @InjectRepository(EmployerData)
    private employerRepo: Repository<EmployerData>,
    private doSpaceService: DOSpacesService,
    private workerService: WorkersService,
    private stripeService: StripeService,
  ) {}

  async findAllFiltered(params?: FilterOffersDto) {
    if (params) {
      const where: FindOptionsWhere<Offer> = {};
      const { limit, offset } = params;
      const { minUsdHour, status, category, fromDate } = params;
      if (minUsdHour) {
        where.usdHour = MoreThanOrEqual(minUsdHour);
      }
      if (status) {
        where.status = Equal(status);
      }
      if (category) {
        where.category = Equal(category);
      }
      if (fromDate) {
        where.from = MoreThanOrEqual(new Date(fromDate));
      }
      return await this.offersRepo.find({
        where,
        take: limit,
        skip: offset,
        loadEagerRelations: false,
        relations: {
          address: true,
          employerUser: {
            employerData: true,
            userImages: true,
          },
          applicants: true,
        },
      });
    } else {
      return await this.offersRepo.find({
        loadEagerRelations: false,
        relations: {
          address: true,
          employerUser: {
            employerData: true,
            userImages: true,
          },
          applicants: true,
        },
      });
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
      relations: {
        applicants: {
          userImages: true,
        },
      },
    });
    return offers;
  }

  async findFavsbyUserId(workerUserId: string) {
    const offers = await this.offersRepo.find({
      where: { favoritedBy: { id: workerUserId } },
      relations: { applicants: true },
    });
    const offersApplicantsFiltered = [];
    if (offers) {
      offers.forEach((offer) => {
        offer.applicants = offer.applicants.filter(
          (user) => user.id === workerUserId,
        );
        offersApplicantsFiltered.push(offer);
      });
    }

    return offersApplicantsFiltered;
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
    if (!data.usdTotal) {
      data.usdTotal = data.usdHour * getHoursDiff(data.from, data.to);
    }
    const employer = await this.employerRepo.findOne({
      where: {
        user: {
          id: employerUserId,
        },
      },
    });
    if (!employer.customerId) {
      throw new ForbiddenException(
        'Cannot create an offer without stripe user',
      );
    }
    const stripeData = await this.stripeService.retrieveCustomer(
      employer.customerId,
    );
    if (!stripeData.invoice_settings.default_payment_method) {
      throw new ForbiddenException(
        'Cannot create an offer without payment method',
      );
    }
    if (moment(data.from) < moment().add(2, 'hours')) {
      throw new BadRequestException(
        'Offer starting time has to be at least 2 hours from now',
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
      console.error(error);
      throw new InternalServerErrorException(error.message);
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

  async remove(offer: Offer) {
    if (offer.status !== OfferStatus.CREATED) {
      throw new ForbiddenException('Cannot delete an accepted or done offer');
    }
    try {
      await this.offersRepo.delete(offer.id);
      console.log(`Offer #${offer.id} removed`);
      return { message: 'Offer removed' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async edit(offer: Offer, changes: UpdateOfferDto) {
    if (offer.status !== OfferStatus.CREATED) {
      throw new ForbiddenException('Cannot edit an accepted or done offer');
    }
    if (offer.applicantsCount > 0) {
      throw new ForbiddenException('Cannot edit an offer with applicants');
    }
    try {
      this.offersRepo.merge(offer, changes);
      return await this.offersRepo.save(offer);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateStatus(offerId: string, status: OfferStatus): Promise<Offer> {
    const offer = await this.offersRepo.findOneBy({ id: offerId });
    offer.status = status;
    try {
      return await this.offersRepo.save(offer);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async removeApplicant(offerId: string, applicantUserId: string) {
    const offer = await this.findOneById(offerId, {
      applicants: true,
      favoritedBy: true,
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    offer.applicants = offer.applicants.filter(
      (applicant) => applicant.id != applicantUserId,
    );
    offer.applicantsCount -= 1;
    offer.favoritedBy = offer.favoritedBy.filter(
      (user) => user.id != applicantUserId,
    );
    try {
      await this.offersRepo.save(offer);
      return { message: 'Applicant removed from offer' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async apply(workerUserId: string, offerId: string) {
    const workerUser = await this.usersRepo.findOneBy({
      id: workerUserId,
      role: Role.WORKER,
    });
    const workerData = await this.workerService.findByUserId(workerUserId);
    if (!workerUser) {
      throw new ForbiddenException('Only workers can apply');
    }
    if (!workerData.stripeId) {
      throw new ConflictException(`Worker doesn't have a payment method set`);
    }
    // Reject application if worker does not has stripe transfers active
    const workerStripeData = await this.workerService.checkStripeAccount(
      workerUserId,
    );
    if (workerStripeData.capabilities.transfers !== 'active') {
      throw new ConflictException(
        `Worker doesn't have money transfers active. Check personal and banking data`,
      );
    }

    const offer = await this.offersRepo.findOne({
      where: {
        id: offerId,
      },
      relations: { applicants: true, favoritedBy: true },
    });
    if (!offer) {
      throw new NotFoundException(`Offer not found`);
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
    if (!offer.favoritedBy.find((user) => user.id === workerUserId)) {
      offer.favoritedBy.push(workerUser);
    }
    try {
      return await this.offersRepo.save(offer);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
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
      throw new InternalServerErrorException(error.message);
    }
  }

  async addToFavs(workerUserId: string, offerId: string) {
    const workerUser = await this.usersRepo.findOne({
      where: {
        id: workerUserId,
        role: Role.WORKER,
      },
    });
    if (!workerUser) {
      throw new ForbiddenException('Only workers can add to fav');
    }

    try {
      const offerWasFavorited = await this.offersRepo.findOne({
        where: {
          id: offerId,
          favoritedBy: {
            id: workerUserId,
          },
        },
      });
      if (offerWasFavorited) {
        await this.offersRepo
          .createQueryBuilder()
          .relation('favoritedBy')
          .of(offerId)
          .remove(workerUserId);
        return { message: 'offer removed from favs' };
      }
      const offer = await this.offersRepo.findOne({
        where: {
          id: offerId,
        },
        relations: {
          favoritedBy: true,
        },
      });
      if (!offer) {
        throw new NotFoundException(`Offer not found`);
      }
      offer.favoritedBy.push(workerUser);
      await this.offersRepo.save(offer);
      return { message: 'offer added to fav' };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
