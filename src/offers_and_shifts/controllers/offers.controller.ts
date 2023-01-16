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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
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
import { AbilitiesGuard } from '../../auth/abilities/abilities.guard';
import { Offer } from '../entities/offer.entity';
import { Action } from '../../auth/abilities/ability.factory';
import { CheckAbilities } from '../../auth/abilities/abilities.decorator';
import { GetReqUser } from '../../auth/get-req-user.decorator';
import { Role } from '../../users/entities/user.entity';
import { FileExtender } from '../../utils/interceptors/file.extender';

@ApiBearerAuth()
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        payload: { type: 'CreateOfferDto' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @CheckAbilities({ action: Action.Create, subject: Offer })
  @UseInterceptors(FileExtender)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tmp/uploads/offers',
      }),
    }),
  )
  @ApiOperation({ summary: 'Crear una oferta' })
  async create(
    @Body() payload: CreateOfferDto,
    @UploadedFile() file: Express.Multer.File,
    @GetReqUser('id') reqUserId,
    @GetReqUser('role') reqUserRole,
  ) {
    if (reqUserRole !== Role.EMPLOYER) {
      throw new ForbiddenException('Only employers can create an offer');
    }
    if (!file) {
      throw new BadRequestException('Must upload an offer video');
    }
    const createdOffer = await this.offerService.create(payload, reqUserId);
    return await this.offerService.uploadOfferVideo(createdOffer, file);
  }

  @Get('created-by-myself')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  @ApiOperation({
    summary: 'Obtener las ofertas creadas por el empleador que consulta',
  })
  async getOffersByLoggedEmployer(@GetReqUser('id') reqUserId) {
    return await this.offerService.findAllByEmployerUserId(reqUserId);
  }

  @Get('favorites')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  @ApiOperation({ summary: 'Obtener las ofertas que agregué a favs' })
  async getFavs(@GetReqUser('id') reqUserId) {
    return await this.offerService.findFavsbyUserId(reqUserId);
  }

  @Get('by-employer/:userId')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  @ApiOperation({
    summary: 'Obtener las ofertas creadas por un empleador en particular',
  })
  async getOffersByEmployer(
    @Param('userId', ParseUUIDPipe) employerUserId: string,
  ) {
    return await this.offerService.findAllByEmployerUserId(employerUserId);
  }

  @Get(':id')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  @ApiOperation({ summary: 'Obtener oferta por su ID' })
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return await this.offerService.findOneById(id);
  }

  @Get(':offerId/applicants')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  @ApiOperation({ summary: 'Obtener los aplicantes de una oferta' })
  async getApplicants(
    @Param('offerId', ParseUUIDPipe) offerId: string,
    @GetReqUser('id') reqUserId,
  ) {
    const offer = await this.offerService.findOneById(offerId, {
      applicants: true,
      employerUser: true,
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
  @ApiOperation({
    summary: 'Subir video presentando una oferta creada previamente',
  })
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
  @ApiOperation({ summary: 'Editar oferta' })
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
  @ApiOperation({ summary: 'Eliminar oferta' })
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
  @CheckAbilities({ action: Action.Remove, subject: Offer })
  @ApiOperation({ summary: 'Eliminar aplicante de una oferta' })
  async deleteApplicant(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('applicantUserId', ParseUUIDPipe) applicantUserId: string,
    @GetReqUser('id') reqUserId,
  ) {
    return await this.offerService.removeApplicant(
      id,
      applicantUserId,
      reqUserId,
    );
  }

  @Post(':offerId/apply')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  @ApiOperation({ summary: 'Aplicar a una oferta' })
  async apply(
    @Param('offerId', ParseUUIDPipe) offerId: string,
    @GetReqUser('id') reqUserId,
  ) {
    return await this.offerService.apply(reqUserId, offerId);
  }

  @Post(':offerId/favourite')
  @CheckAbilities({ action: Action.Read, subject: Offer })
  @ApiOperation({ summary: 'Agregar o eliminar oferta de mis favoritos' })
  async addToFav(
    @Param('offerId', ParseUUIDPipe) offerId: string,
    @GetReqUser('id') reqUserId,
  ) {
    return await this.offerService.addToFavs(reqUserId, offerId);
  }
}
