import {
  IsNumber,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  Min,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateShiftDto {
  @IsBoolean()
  @ApiProperty()
  readonly clockIn: boolean;

  @IsBoolean()
  @ApiProperty()
  readonly clockOut: boolean;

  @IsNumber()
  @ApiProperty()
  readonly status: number;

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
