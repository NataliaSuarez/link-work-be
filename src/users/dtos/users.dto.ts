import {
  IsString,
  IsNumber,
  IsUrl,
  IsEmail,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @IsString()
  @IsNotEmpty()
  readonly city: string;

  @IsString()
  @IsNotEmpty()
  readonly state: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsUrl()
  @IsNotEmpty()
  readonly profileImg: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(2)
  readonly role: number;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
