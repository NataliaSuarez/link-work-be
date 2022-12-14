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
  UploadedFiles,
  BadRequestException,
  UseFilters,
  HttpException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import {
  CreateWorkerDto,
  StripeBankAccDto,
  UpdateStarsDto,
  UpdateWorkerDto,
} from '../dtos/workers.dto';
import { WorkersService } from '../services/workers.service';
import { GetReqUser } from '../../auth/get-req-user.decorator';
import { AccessTokenGuard } from '../../auth/jwt/accessToken.guard';
import { CheckAbilities } from '../../auth/abilities/abilities.decorator';
import { Action } from '../../auth/abilities/ability.factory';
import { WorkerData } from '../entities/worker_data.entity';
import { Role } from '../entities/user.entity';
import { EmailConfirmationGuard } from '../../auth/mail/emailConfirmation.guard';
import { FileExtender } from '../../utils/interceptors/file.extender';
import { UsersService } from '../services/users.service';
import { AllExceptionsFilter } from '../../utils/filters/all-exceptions.filter';

@UseFilters(AllExceptionsFilter)
@ApiBearerAuth()
@UseGuards(EmailConfirmationGuard)
@UseGuards(AccessTokenGuard)
@ApiTags('workers')
@Controller('workers')
export class WorkersController {
  constructor(
    private workersService: WorkersService,
    private usersService: UsersService,
  ) {}

  @Get('stripe-account-data')
  @CheckAbilities({ action: Action.Read, subject: WorkerData })
  @ApiOperation({ summary: 'Obtener data del worker en Stripe' })
  async getStripeData(@GetReqUser('id') workerUserId) {
    return await this.workersService.checkStripeAccount(workerUserId);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        payload: { type: 'CreateWorkerDto' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileExtender)
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './tmp/uploads/workers',
      }),
    }),
  )
  @CheckAbilities({ action: Action.Create, subject: WorkerData })
  @ApiOperation({ summary: 'Crear perfil con datos de trabajador' })
  async create(
    @Body() payload: CreateWorkerDto,
    @GetReqUser('id') reqUserId,
    @UploadedFiles()
    file: Express.Multer.File[],
  ) {
    try {
      await this.workersService.create(payload, reqUserId);
      if (file) {
        await this.workersService.uploadWorkerFiles(reqUserId, file);
      }
      if (payload.accountNumber) {
        if (!payload.routingNumber || payload.routingNumber.length != 9) {
          throw new BadRequestException('No valid routing number');
        }
        const respStripe = await this.workersService.generateStripeAccountData(
          reqUserId,
          {
            accountNumber: payload.accountNumber,
            routingNumber: payload.routingNumber,
          },
        );
        if (respStripe.type == 'StripeInvalidRequestError') {
          throw new BadRequestException(`${respStripe.raw.code}`);
        }
      }
      return await this.workersService.findByUserId(reqUserId);
    } catch (error) {
      await this.workersService.deleteWorkerDataByUserId(reqUserId);
      throw new HttpException(error.response, error.response.statusCode);
    }
  }

  @Post('create-stripe-account')
  @CheckAbilities({ action: Action.Update, subject: WorkerData })
  @ApiOperation({
    summary:
      'Crear perfil de Stripe con datos de cuenta para recibir transferencias',
  })
  async createStripeUserAccount(
    @GetReqUser('id') reqUserId,
    @Body() payload: StripeBankAccDto,
  ) {
    return await this.workersService.generateStripeAccountData(
      reqUserId,
      payload,
    );
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
  @ApiOperation({
    summary: 'Subir video de perfil de experiencia del trabajador',
  })
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
  @ApiOperation({ summary: 'Puntuar a un trabajador con estrellas' })
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        payload: { type: 'UpdateWorkerDto' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileExtender)
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './tmp/uploads/workers',
      }),
    }),
  )
  @CheckAbilities({ action: Action.Update, subject: WorkerData })
  @ApiOperation({ summary: 'Actualizar datos del perfil de trabajador' })
  async update(
    @Body() payload: UpdateWorkerDto,
    @GetReqUser('id') reqUserId,
    @UploadedFiles()
    file: Express.Multer.File[],
  ) {
    if (payload.stripeId) {
      throw new ForbiddenException("Can't update stripe id");
    }
    if (file) {
      await this.workersService.uploadWorkerFiles(reqUserId, file);
    }
    if (payload.accountNumber) {
      if (!payload.routingNumber || payload.routingNumber.length < 9) {
        throw new BadRequestException('No valid routing number');
      }
      const respStripe = await this.workersService.generateStripeAccountData(
        reqUserId,
        {
          accountNumber: payload.accountNumber,
          routingNumber: payload.routingNumber,
        },
      );
      if (respStripe.type == 'StripeInvalidRequestError') {
        throw new BadRequestException(`${respStripe.raw.code}`);
      }
    }
    await this.workersService.update(reqUserId, payload);
    return await this.workersService.findByUserId(reqUserId);
  }
}
