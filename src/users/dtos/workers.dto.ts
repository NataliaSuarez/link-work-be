import {
  IsNumber,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  Min,
  IsString,
  IsUrl,
  Max,
  IsUUID,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateWorkerDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly dayOfBirth: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly monthOfBirth: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly yearOfBirth: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly phone: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  readonly personalUrl: string;

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

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  readonly avgStars?: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly stripeId?: string;

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

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly postalCode: string;

  @IsUUID()
  readonly userId: string;
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

  @IsUUID()
  readonly workerId: string;
}

export class UpdateWorkExperience extends PartialType(
  CreateWorkExperienceDto,
) {}

export class StripeUserAccDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  routingNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  accountNumber: string;
}

export class UpdateStarsDto {
  @IsPositive()
  @IsNumber()
  @Min(0)
  @Max(5)
  stars: number;
}
