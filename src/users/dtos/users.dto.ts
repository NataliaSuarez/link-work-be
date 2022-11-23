import {
  IsString,
  IsUrl,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RegisterType, Role } from '../entities/user.entity';

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
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  @ApiProperty()
  readonly repeatPassword?: string;

  @IsEnum(RegisterType)
  @ApiProperty()
  readonly registerType: RegisterType;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  readonly verified?: boolean;

  @IsUrl()
  @IsOptional()
  @ApiProperty()
  readonly profileImg?: string;

  @IsEnum(Role)
  @ApiPropertyOptional()
  readonly role?: Role;

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
  @IsEnum(Role)
  @IsOptional()
  role?: number;
}

export class UserIdDto {
  @IsUUID()
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
  @IsOptional()
  @ApiProperty()
  principal?: boolean;
}
