import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  Min,
  Max,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { CardDto } from '../../stripe/stripe.dto';
import { CreateAddressDto } from './users.dto';

export enum EmployerEditType {
  CARD_DATA = 'cardData',
  OTHER = 'other',
}

export class CreateEmployerDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty()
  @ApiPropertyOptional()
  readonly businessCode?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly businessName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @ApiPropertyOptional()
  readonly businessUrl?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @ApiPropertyOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  @ApiPropertyOptional()
  readonly stars?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  @ApiPropertyOptional()
  readonly totalReviews?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  @ApiPropertyOptional()
  readonly avgStars?: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  @ApiPropertyOptional()
  readonly lastFour?: string;

  @IsString()
  @IsOptional()
  readonly customerId?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty()
  @ApiPropertyOptional()
  cardData?: CardDto;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  readonly addressData: CreateAddressDto;

  @IsEnum(EmployerEditType)
  @IsOptional()
  readonly employerEditEnum?: EmployerEditType;
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
