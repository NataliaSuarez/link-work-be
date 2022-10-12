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
  MinLength,
  MaxLength,
  Matches,
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
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  @ApiProperty()
  readonly password?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(20)
  readonly passwordConfirm?: string;

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
