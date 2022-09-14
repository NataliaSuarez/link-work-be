import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, FindOptionsWhere } from 'typeorm';

import {
  CreateOfferDto,
  FilterOffersDto,
  UpdateOfferDto,
} from '../dtos/offers.dto';
import { Offers } from '../entities/offers.entity';
import { Worker } from '../../users/entities/worker.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offers) private offerRepo: Repository<Offers>,
    @InjectRepository(Worker) private workerRepo: Repository<Worker>,
  ) {}

  findAll(params?: FilterOffersDto) {
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
      return this.offerRepo.find({
        where,
        take: limit,
        skip: offset,
        relations: ['applicants', 'employer'],
      });
    }
    return this.offerRepo.find();
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

  create(data: CreateOfferDto) {
    const newOffer = this.offerRepo.create(data);
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
}
