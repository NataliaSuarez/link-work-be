import {
  IsNumber,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  Min,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateShiftDto {
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
  readonly clockOut?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly confirmedClockOut?: boolean;

  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly autoConfirmed?: Date;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  readonly status?: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @ApiProperty()
  readonly workerId: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @ApiProperty()
  readonly offerId: number;
}

export class UpdateShiftDto extends PartialType(CreateShiftDto) {}

export class FilterShiftsDto {
  @IsOptional()
  @IsPositive()
  limit: number;

  @IsOptional()
  @Min(0)
  offset: number;

  @IsOptional()
  @IsNumber()
  status: number;
}
