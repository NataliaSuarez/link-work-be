import {
  IsString,
  IsNumber,
  IsUrl,
  IsEmail,
  IsNotEmpty,
  Min,
  Max,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  IsPositive,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly lastName?: string;

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

export class FilterUsersDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(2)
  role: number;
}

export class UserIdDto {
  @IsNumber()
  @ApiProperty()
  userId: number;
}

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  city: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  state: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  postalCode: string;

  @IsBoolean()
  @ApiProperty()
  principal: boolean;

  @IsNumber()
  @ApiProperty()
  userId: number;
}
