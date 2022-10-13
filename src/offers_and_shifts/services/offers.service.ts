import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, FindOptionsWhere } from 'typeorm';

import {
  ApplyDto,
  CreateOfferDto,
  FilterOffersDto,
  UpdateOfferDto,
} from '../dtos/offers.dto';
import { Offers } from '../entities/offers.entity';
import { Worker } from '../../users/entities/worker.entity';
import { Employer } from '../../users/entities/employer.entity';
import { EmployersService } from '../../users/services/employers.service';
import { Shift } from '../entities/shift.entity';
import { getDay0, getDay6, getHoursDiff } from 'src/utils/dates';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offers) private offerRepo: Repository<Offers>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
    @InjectRepository(Employer) private employerRepo: Repository<Employer>,
    @InjectRepository(Shift) private shiftRepo: Repository<Shift>,
    private employerServices: EmployersService,
  ) {}

  async findAllFiltered(params?: FilterOffersDto) {
    if (params) {
      const where: FindOptionsWhere<Offers> = {};
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

  async findOne(id: number): Promise<Offers> {
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

  async findByEmployer(employerId: number): Promise<Offers[]> {
    const offers = await this.offerRepo.find({
      relations: {
        employer: true,
      },
      where: {
        employer: {
          id: employerId,
        },
      },
    });
    if (!offers) {
      throw new NotFoundException(`Employer #${employerId} has not any offer`);
    }
    return offers;
  }

  async create(data: CreateOfferDto) {
    const newOffer = this.offerRepo.create(data);
    const employer = await this.employerServices.findOne(data.employerId);
    newOffer.employer = employer;
    return this.offerRepo.save(newOffer);
  }

  remove(id: number) {
    return this.offerRepo.delete(id);
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
    this.offerRepo.merge(offer, changes);
    return this.offerRepo.save(offer);
  }

  async removeApplicant(offerId: number, applicantId: number) {
    const offer = await this.offerRepo.findOne({
      where: {
        id: offerId,
      },
      relations: ['applicants'],
    });
    offer.applicants = offer.applicants.filter(
      (item) => item.id != applicantId,
    );
    return this.offerRepo.save(offer);
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
    return this.offerRepo.save(offer);
  }

  async validWorkerForShift(workerId: number, offerFrom: Date, offerTo: Date) {
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
    // console.log(moment(offerFrom).format('YYYY-MM-DD HH:mm:ss'));
    // console.log(moment(offerTo).format('YYYY-MM-DD HH:mm:ss'));

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
  }
}
