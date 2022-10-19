import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateEmployerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly city: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly state: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  readonly businessCode?: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly businessName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly description?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  readonly stars?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  readonly totalReviews?: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly customerId?: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  readonly userId: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly number?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  readonly exp_month?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  readonly exp_year?: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly cvc?: string;
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
