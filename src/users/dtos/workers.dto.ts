import { IsString, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateWorkerDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsNumber()
  @IsNotEmpty()
  readonly age: number;

  @IsPositive()
  @IsNotEmpty()
  readonly userId: number;
}

export class UpdateWorkerDto extends PartialType(CreateWorkerDto) {}
