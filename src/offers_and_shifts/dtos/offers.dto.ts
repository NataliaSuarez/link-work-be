import {
  IsNumber,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsDate,
  IsOptional,
  Min,
  IsUrl,
  IsEnum,
  Length,
  IsUUID,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OfferCategory, OfferStatus } from '../entities/offer.entity';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  @ApiProperty()
  readonly title: string;

  @IsDate()
  @ApiProperty()
  readonly from: Date;

  @IsDate()
  @ApiProperty()
  readonly to: Date;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @ApiProperty()
  readonly usdHour: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @ApiProperty()
  usdTotal?: number;

  @IsEnum(OfferCategory)
  @IsOptional()
  @ApiProperty()
  readonly category?: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly description?: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty()
  readonly videoUrl?: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  readonly addressId: string;
}

export class UpdateOfferDto extends PartialType(CreateOfferDto) {
  @IsEnum(OfferStatus)
  @IsOptional()
  @ApiProperty()
  readonly status?: number;
}

export class FilterOffersDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  minUsdHour: number;

  @IsOptional()
  @IsEnum(OfferCategory)
  category: number;

  @IsOptional()
  @IsEnum(OfferStatus)
  status: number;
}
