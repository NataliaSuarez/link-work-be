import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Delete,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import {
  ApplyDto,
  CreateOfferDto,
  FilterOffersDto,
  UpdateOfferDto,
} from '../dtos/offers.dto';
import { OffersService } from '../services/offers.service';
import { AccessTokenGuard } from '../../common/guards/accessToken.guard';
import { DOSpacesService } from '../../spaces/services/doSpacesService';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('offers')
@Controller('offers')
export class OffersController {
  constructor(private offerService: OffersService) {}

  @Get()
  getOffers(@Query() params: FilterOffersDto) {
    return this.offerService.findAllFiltered(params);
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.offerService.findOne(id);
  }

  @Get(':id/applicants')
  getApplicants(@Param('id', ParseIntPipe) id: number) {
    return this.offerService.findApplicants(id);
  }

  //@UseGuards(AccessTokenGuard)
  @Post()
  create(@Body() payload: CreateOfferDto) {
    return this.offerService.create(payload);
  }

  @Post(':id/upload-video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tmp/uploads/offers',
      }),
    }),
  )
  async createByVideo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.offerService.uploadOfferVideo(id, file);
  }

  @Get(':id/video')
  async downloadFileUrl(@Param('id') offerId: number) {
    return this.offerService.getDownloadFileUrl(offerId);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() payload: UpdateOfferDto) {
    return this.offerService.update(id, payload);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.offerService.remove(id);
  }

  @Delete(':id/applicant/:applicantId')
  deleteApplicant(
    @Param('id') id: number,
    @Param('applicantId') applicantId: number,
  ) {
    return this.offerService.removeApplicant(id, applicantId);
  }

  @Post(':id/apply')
  apply(@Param('id') id: number, @Body() payload: ApplyDto) {
    return this.offerService.apply(id, payload);
  }
}
