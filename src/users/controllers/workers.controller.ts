import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import {
  CreateWorkerDto,
  StripeUserAccDto,
  UpdateStarsDto,
  UpdateWorkerDto,
} from '../dtos/workers.dto';
import { WorkersService } from '../services/workers.service';
import { GetReqUser } from 'src/auth/get-req-user.decorator';
import { AccessTokenGuard } from 'src/auth/jwt/accessToken.guard';
import { CheckAbilities } from 'src/auth/abilities/abilities.decorator';
import { Action } from 'src/auth/abilities/ability.factory';
import { WorkerData } from '../entities/worker_data.entity';
import { Role } from '../entities/user.entity';

@UseGuards(AccessTokenGuard)
@ApiTags('workers')
@Controller('workers')
export class WorkersController {
  constructor(private workersService: WorkersService) {}

  @Get('stripe-account-data')
  @CheckAbilities({ action: Action.Read, subject: WorkerData })
  async getStripeData(@GetReqUser('id') workerUserId) {
    return await this.workersService.checkStripeAccount(workerUserId);
  }

  @Post()
  @CheckAbilities({ action: Action.Create, subject: WorkerData })
  async create(@Body() payload: CreateWorkerDto, @GetReqUser('id') reqUserId) {
    return await this.workersService.create(payload, reqUserId);
  }

  @Post('create-stripe-account')
  @CheckAbilities({ action: Action.Update, subject: WorkerData })
  async createStripeUserAccount(
    @GetReqUser('id') reqUserId,
    @Body() payload: StripeUserAccDto,
  ) {
    return await this.workersService.createStripeAccount(reqUserId, payload);
  }

  @Post('upload-video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tmp/uploads/workers',
      }),
    }),
  )
  @CheckAbilities({ action: Action.Update, subject: WorkerData })
  async addExperienceVideo(
    @UploadedFile() file: Express.Multer.File,
    @GetReqUser('id') reqUserId,
    @GetReqUser('role') reqUserRole,
  ) {
    if (reqUserRole !== Role.WORKER) {
      throw new ForbiddenException(
        'Only workers can add work experience videos',
      );
    }
    return await this.workersService.uploadExperienceVideo(reqUserId, file);
  }

  @Put(':userId/add-review')
  @CheckAbilities({ action: Action.Read, subject: WorkerData })
  async addReview(
    @Param('userId') workerUserId: string,
    @Body() payload: UpdateStarsDto,
    @GetReqUser('role') reqUserRole,
  ) {
    if (reqUserRole !== Role.EMPLOYER) {
      throw new ForbiddenException('Only employers can add reviews of workers');
    }
    const workerData = await this.workersService.findByUserId(workerUserId);
    return await this.workersService.updateStars(workerData, payload.stars);
  }

  @Put()
  @CheckAbilities({ action: Action.Update, subject: WorkerData })
  async update(@Body() payload: UpdateWorkerDto, @GetReqUser('id') reqUserId) {
    if (payload.stripeId) {
      throw new ForbiddenException("Can't update stripe id");
    }
    return await this.workersService.update(reqUserId, payload);
  }
}
