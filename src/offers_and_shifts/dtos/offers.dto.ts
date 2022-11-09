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
  ValidateIf,
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
  @IsNotEmpty()
  @IsPositive()
  @ApiProperty()
  readonly usdTotal: number;

  @IsEnum(OfferCategory)
  @ApiProperty()
  readonly category: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly description?: string;

  @IsUrl()
  @IsOptional()
  @ApiProperty()
  readonly videoUrl?: string;

  @IsUUID()
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
  usdHour: number;

  @IsOptional()
  @IsEnum(OfferStatus)
  status: number;
}
