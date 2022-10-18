import {
  IsNumber,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsArray,
  IsDate,
  IsOptional,
  Min,
  IsUrl,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
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

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
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

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  readonly status?: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @ApiProperty()
  readonly employerId: number;

  @IsArray()
  @IsOptional()
  @ApiProperty()
  readonly applicantsIds?: number[];
}

export class UpdateOfferDto extends PartialType(CreateOfferDto) {}

export class FilterOffersDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  usdHour: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  status: number;
}

export class ApplyDto {
  @IsNumber()
  workerId: number;
}
