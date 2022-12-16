import { IsOptional, IsDate, IsBoolean, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ShiftStatus } from '../entities/shift.entity';

export class CreateShiftDto {
  @IsUUID()
  @ApiProperty()
  readonly workerUserId: string;

  @IsUUID()
  @ApiProperty()
  readonly offerId: string;
}

export class UpdateShiftDto {
  @IsEnum(ShiftStatus)
  @IsOptional()
  @ApiProperty()
  readonly status?: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly clockOut?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly clockIn?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly confirmedClockIn?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly confirmedClockOut?: boolean;

  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly autoConfirmed?: Date;
}

export class FilterShiftsDto extends PaginationDto {
  @IsEnum(ShiftStatus)
  @IsOptional()
  @ApiProperty()
  readonly status?: number;
}
