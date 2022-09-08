import { IsString, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateEmployerDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsNumber()
  @IsNotEmpty()
  readonly age: number;

  @IsString()
  @IsNotEmpty()
  readonly businessName: string;

  @IsPositive()
  @IsNotEmpty()
  readonly userId: number;
}

export class UpdateEmployerDto extends PartialType(CreateEmployerDto) {}
