import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, FindOptionsWhere } from 'typeorm';

import {
  ApplyDto,
  CreateOfferDto,
  FilterOffersDto,
  UpdateOfferDto,
} from '../dtos/offers.dto';
import { Offer } from '../entities/offer.entity';
import { Worker } from '../../users/entities/worker.entity';
import { Employer } from '../../users/entities/employer.entity';
import { EmployersService } from '../../users/services/employers.service';
import { Shift } from '../entities/shift.entity';
import { getDay0, getDay6, getHoursDiff } from 'src/utils/dates';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DOSpacesService } from '../../spaces/services/doSpacesService';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer) private offerRepo: Repository<Offer>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
    @InjectRepository(Employer) private employerRepo: Repository<Employer>,
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
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
      return await this.offerRepo.find({
        where,
        take: limit,
        skip: offset,
        relations: ['applicants', 'employer'],
      });
    }
    return await this.offerRepo.find();
  }

  async findOne(id: number): Promise<Offer> {
    const offer = await this.offerRepo.findOne({
      where: { id: id },
      relations: ['applicants', 'employer'],
    });
    if (!offer) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
    return offer;
  }

  async findApplicants(offerId: number): Promise<Worker[]> {
    const offer = await this.offerRepo.findOne({
      where: {
        id: offerId,
      },
      relations: ['applicants'],
    });
    if (!offer) {
      throw new NotFoundException(`Offer #${offerId} not found`);
    }
    return offer.applicants;
  }

  async findByEmployer(
    employerId: number,
    pagination?: PaginationDto,
  ): Promise<Offer[]> {
    const offers = await this.offerRepo.find({
      relations: {
        employer: true,
      },
      where: {
        employer: {
          id: employerId,
        },
      },
      skip: pagination.offset,
      take: pagination.limit,
    });
    if (!offers) {
      throw new NotFoundException(`Employer #${employerId} has not any offer`);
    }
    return offers;
  }

  async create(data: CreateOfferDto) {
    const employer = await this.employerRepo.findOneBy({ id: data.employerId });
    if (!employer) {
      throw new NotFoundException('Employer not found');
    }
    try {
      const newOffer = this.offerRepo.create(data);
      newOffer.employer = employer;
      return this.offerRepo.save(newOffer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async uploadOfferVideo(offerId: number, file: Express.Multer.File) {
    try {
      const offer = await this.findOne(offerId);
      const fileUrl = await this.doSpaceService.uploadOfferVideo(
        file,
        offer.employer.id,
        offerId,
      );
      const updatedOffer = await this.update(offerId, { videoUrl: fileUrl });
      return updatedOffer;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getDownloadFileUrl(offerId: number) {
    try {
      const offer = await this.findOne(offerId);
      const url = await this.doSpaceService.downloadFile(offer.videoUrl);
      return url;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async remove(id: number) {
    try {
      await this.offerRepo.delete(id);
      return { message: 'Offer removed' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async update(id: number, changes: UpdateOfferDto) {
    const offer = await this.offerRepo.findOne({
      where: {
        id: id,
      },
      relations: ['applicants'],
    });
    if (!offer) {
      throw new NotFoundException(`Offer #${id} not found`);
    }
    if (
      offer.applicants.length != 0 &&
      changes.status != 1 &&
      changes.status != 2
    ) {
      throw new ForbiddenException("Can't edit an offer with applicants");
    }
    if (changes.applicantsIds) {
      const worker = await this.workerRepo.findOneBy({
        id: changes.applicantsIds[0],
      });
      if (!worker) {
        throw new NotFoundException(
          `Worker #${changes.applicantsIds[0]} not found`,
        );
      }
      offer.applicants.push(worker);
    }
    try {
      this.offerRepo.merge(offer, changes);
      return this.offerRepo.save(offer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async removeApplicant(offerId: number, applicantId: number) {
    const offer = await this.offerRepo.findOne({
      where: {
        id: offerId,
      },
      relations: ['applicants'],
    });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    offer.applicants = offer.applicants.filter(
      (item) => item.id != applicantId,
    );
    try {
      await this.offerRepo.save(offer);
      return { message: 'Applicant removed from offer' };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async apply(offerId: number, data: ApplyDto) {
    const applicantId = data.workerId;
    const offer = await this.offerRepo.findOne({
      where: {
        id: offerId,
      },
      relations: ['applicants'],
    });
    if (!offer) {
      throw new NotFoundException(`Offer #${offerId} not found`);
    }
    const worker = await this.workerRepo.findOneBy({ id: applicantId });
    if (!worker) {
      throw new NotFoundException(`Worker #${applicantId} not found`);
    }
    const valid = await this.validWorkerForShift(
      data.workerId,
      offer.from,
      offer.to,
    );
    if (valid === false) {
      throw new ForbiddenException(
        `Worker #${applicantId} is full of shift hours at this week`,
      );
    }
    offer.applicants.push(worker);
    try {
      await this.offerRepo.save(offer);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async validWorkerForShift(workerId: number, offerFrom: Date, offerTo: Date) {
    try {
      const shifts = await this.shiftRepo.find({
        relations: {
          offer: true,
          worker: true,
        },
        where: [
          { worker: { id: workerId }, status: 0 },
          { worker: { id: workerId }, status: 1 },
        ],
      });

      const weekDay0 = getDay0(offerFrom);
      const weekDay6 = getDay6(offerFrom);
      const offerHours = getHoursDiff(offerFrom, offerTo);

      let hoursWeek = 0;

      for (const object of shifts) {
        if (object.offer.from >= weekDay0 && object.offer.from <= weekDay6) {
          const hoursDiff = getHoursDiff(object.offer.from, object.offer.to);
          hoursWeek += hoursDiff;
        }
      }

      const totalHours = hoursWeek + offerHours;
      if (totalHours >= 40) {
        return false;
      }
      return true;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
