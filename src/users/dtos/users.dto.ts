import {
  IsString,
  IsNumber,
  IsUrl,
  IsEmail,
  IsNotEmpty,
  Min,
  Max,
  IsOptional,
  IsPositive,
  IsBoolean,
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

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  readonly email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly password?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(2)
  @ApiProperty()
  readonly registerType: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly verified?: boolean;

  @IsUrl()
  @IsOptional()
  @ApiProperty()
  readonly profileImg?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(2)
  @ApiProperty()
  readonly role: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly refreshToken?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly googleToken?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class FilterUsersDto {
  @IsOptional()
  @IsPositive()
  limit: number;

  @IsOptional()
  @Min(0)
  offset: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(2)
  role: number;
}
