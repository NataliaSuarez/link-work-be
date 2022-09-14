import {
  IsNumber,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateWorkerDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly age: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly stars: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly totalReviews: number;

  @IsPositive()
  @IsNotEmpty()
  readonly userId: number;
}

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {}

export class FilterWorkersDto {
  @IsOptional()
  @IsPositive()
  limit: number;

  @IsOptional()
  @Min(0)
  offset: number;
}
