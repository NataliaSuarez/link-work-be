import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import {
  CreateOfferDto,
  FilterOffersDto,
  UpdateOfferDto,
} from '../dtos/offers.dto';
import { OffersService } from '../services/offers.service';
import { AccessTokenGuard } from '../../auth/jwt/accessToken.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AbilitiesGuard } from 'src/auth/abilities/abilities.guard';
import { Offer } from '../entities/offer.entity';
import { Action } from 'src/auth/abilities/ability.factory';
import { CheckAbilities } from 'src/auth/abilities/abilities.decorator';
import { GetReqUser } from 'src/auth/get-req-user.decorator';
import { Role } from 'src/users/entities/user.entity';

@Controller('offers')
@ApiTags('offers')
@UseGuards(AccessTokenGuard, AbilitiesGuard)
export class OffersController {
  constructor(private offerService: OffersService) {}

  @Get()
  @ApiOperation({ summary: 'Filtro y paginación de ofertas' })
  @CheckAbilities({ action: Action.Read, subject: Offer })
  async getOffers(@Query() params: FilterOffersDto) {
    return await this.offerService.findAllFiltered(params);
  }

  @Post()
  @CheckAbilities({ action: Action.Create, subject: Offer })
  async create(
    @Body() payload: CreateOfferDto,
    @GetReqUser('id') reqUserId,
    @GetReqUser('role') reqUserRole,
  ) {
    if (reqUserRole !== Role.EMPLOYER) {
      throw new ForbiddenException('Only employers can create an offer');
    }
    return await this.offerService.create(payload, reqUserId);
  }

  @Get('created-by-myself')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  async getOffersByLoggedEmployer(@GetReqUser('id') reqUserId) {
    return await this.offerService.findAllByEmployerUserId(reqUserId);
  }

  @Get('favorites')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  async getFavs(@GetReqUser('id') reqUserId) {
    return await this.offerService.findFavsbyUserId(reqUserId);
  }

  @Get('by-employer/:userId')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  async getOffersByEmployer(
    @Param('userId', ParseUUIDPipe) employerUserId: string,
  ) {
    return await this.offerService.findAllByEmployerUserId(employerUserId);
  }

  @Get(':id')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const offer = await this.offerService.findOneById(id, { applicants: true });
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  @Get(':id/applicants')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  async getApplicants(
    @Param('id', ParseUUIDPipe) offerId: string,
    @GetReqUser('id') reqUserId,
  ) {
    const offer = await this.offerService.findOneById(offerId, {
      applicants: true,
    });

    if (!offer || offer.employerUser.id !== reqUserId) {
      throw new NotFoundException('Offer not found');
    }
    return offer.applicants;
  }

  @Post(':offerId/upload-video')
  @CheckAbilities({ action: Action.Update, subject: Offer })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tmp/uploads/offers',
      }),
    }),
  )
  async createByVideo(
    @Param('offerId', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetReqUser('id') reqUserId,
  ) {
    const offer = await this.offerService.findOneById(id);
    if (!offer || offer.employerUser.id !== reqUserId) {
      throw new NotFoundException('Offer not found');
    }
    return await this.offerService.uploadOfferVideo(offer, file);
  }

  @Put(':id')
  @CheckAbilities({ action: Action.Update, subject: Offer })
  async edit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateOfferDto,
    @GetReqUser('id') reqUserId,
  ) {
    const offer = await this.offerService.findOneById(id);
    if (!offer || offer.employerUser.id !== reqUserId) {
      throw new NotFoundException('Offer not found');
    }
    return await this.offerService.edit(offer, payload);
  }

  @Delete(':id')
  @CheckAbilities({ action: Action.Delete, subject: Offer })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @GetReqUser('id') reqUserId,
  ) {
    const offer = await this.offerService.findOneById(id);
    if (!offer || offer.employerUser.id !== reqUserId) {
      throw new NotFoundException('Offer not found');
    }
    return await this.offerService.remove(offer);
  }

  @Delete(':id/applicant/:applicantUserId')
  @CheckAbilities({ action: Action.Update, subject: Offer })
  async deleteApplicant(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('applicantUserId', ParseUUIDPipe) applicantUserId: string,
    @GetReqUser('id') reqUserId,
  ) {
    const offer = await this.offerService.findOneById(id);
    if (!offer || offer.employerUser.id !== reqUserId) {
      throw new NotFoundException('Offer not found');
    }
    return await this.offerService.removeApplicant(id, applicantUserId);
  }

  @Post(':offerId/apply')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  async apply(
    @Param('offerId', ParseUUIDPipe) offerId: string,
    @GetReqUser('id') reqUserId,
  ) {
    const offer = await this.offerService.findOneById(offerId, {
      applicants: true,
    });
    if (!offer) {
      throw new NotFoundException(`Offer not found`);
    }
    return await this.offerService.apply(reqUserId, offer);
  }

  @Post(':offerId/add-fav')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  async addToFav(
    @Param('offerId', ParseUUIDPipe) offerId: string,
    @GetReqUser('id') reqUserId,
  ) {
    const offer = await this.offerService.findOneById(offerId, {
      favoritedBy: true,
    });
    if (!offer) {
      throw new NotFoundException(`Offer not found`);
    }
    return await this.offerService.addToFavs(reqUserId, offer);
  }
}
