import {
  IsNumber,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  Min,
  IsString,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateWorkerDto {
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
  @IsNotEmpty()
  @ApiProperty()
  readonly age: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly gender: number;

  @IsString()
  @ApiProperty()
  readonly description: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly ssn: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly stars: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly totalReviews: number;

  @IsString()
  @ApiProperty()
  readonly stripeId: string;

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

export class CreateWorkExperienceDto {
  @IsString()
  @ApiProperty()
  readonly description: string;

  @IsPositive()
  @IsNotEmpty()
  readonly workerId: number;
}

export class UpdateWorkExperience extends PartialType(
  CreateWorkExperienceDto,
) {}
