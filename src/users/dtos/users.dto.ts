import {
  IsString,
  IsNumber,
  IsUrl,
  IsEmail,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly lastName: string;

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

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly password: string;

  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  readonly profileImg: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(2)
  @ApiProperty()
  readonly role: number;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
