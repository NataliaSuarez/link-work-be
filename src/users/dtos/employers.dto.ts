import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { CardDto } from '../../stripe/stripe.dto';
import { CreateAddressDto } from './users.dto';

export class CreateEmployerDto {
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  readonly businessCode?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly businessName: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly businessUrl?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly description?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  readonly stars?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  readonly totalReviews?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  readonly avgStars?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  readonly lastFour?: string;

  @IsString()
  @IsOptional()
  readonly customerId?: string;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional()
  readonly cardData?: CardDto;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  readonly addressData: CreateAddressDto;
}

export class UpdateEmployerDto extends PartialType(CreateEmployerDto) {}

export class FilterEmployersDto {
  @IsOptional()
  @IsPositive()
  limit: number;

  @IsOptional()
  @Min(0)
  offset: number;
}

export class UpdateStarsDto {
  @IsNumber()
  @Min(0)
  @Max(5)
  stars: number;
}
