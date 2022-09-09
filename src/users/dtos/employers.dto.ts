import { IsString, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateEmployerDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly businessCode: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly businessName: string;

  @IsPositive()
  @IsNotEmpty()
  readonly userId: number;
}

export class UpdateEmployerDto extends PartialType(CreateEmployerDto) {}
