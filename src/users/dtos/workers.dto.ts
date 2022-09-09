import { IsString, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateWorkerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly workPlace: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly workingTime: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly age: number;

  @IsPositive()
  @IsNotEmpty()
  readonly userId: number;
}

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {}
