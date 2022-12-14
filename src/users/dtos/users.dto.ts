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
  IsNumber,
  IsObject,
  IsArray,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  BlockedReason,
  ProfileStatus,
  RegisterType,
  Role,
} from '../entities/user.entity';
import { WorkerData } from '../entities/worker_data.entity';
import { EmployerData } from '../entities/employer_data.entity';
import { Offer } from '../../offers_and_shifts/entities/offer.entity';
import { Shift } from 'src/offers_and_shifts/entities/shift.entity';
import { UserImage } from '../entities/user_image.entity';
import { Address } from '../entities/address.entity';
import { Clock } from 'src/offers_and_shifts/entities/clock.entity';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true })
  readonly appleIdIdentifier?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true })
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true })
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
  @ApiProperty({ nullable: true })
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

  @IsEnum(Role)
  @ApiProperty()
  readonly role?: Role;

  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true })
  readonly retrieveToken?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true })
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

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lat: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  long: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  principal?: boolean;
}

export class UserDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  id: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true })
  firstName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true })
  lastName?: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsEnum(RegisterType)
  @IsNotEmpty()
  @ApiProperty({ type: RegisterType })
  registerType: RegisterType;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  verified: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  blocked: boolean;

  @IsEnum(BlockedReason)
  @IsNotEmpty()
  @ApiProperty({ type: BlockedReason })
  blockedReason: BlockedReason;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  failedAttemptsToLogin: number;

  @IsUrl()
  @IsOptional()
  @ApiProperty({ nullable: true })
  profileImg?: string;

  @IsEnum(Role)
  @IsNotEmpty()
  @ApiProperty({ type: Role })
  role: Role;

  @IsEnum(ProfileStatus)
  @IsNotEmpty()
  @ApiProperty({ type: ProfileStatus })
  profileStatus: ProfileStatus;

  @IsObject()
  @IsOptional()
  @ApiProperty({ nullable: true, type: WorkerData })
  workerData?: WorkerData;

  @IsArray()
  @ApiProperty()
  appliedOffers: Offer[];

  @IsArray()
  @ApiProperty()
  workerFavoriteOffers: Offer[];

  @IsArray()
  @ApiProperty()
  workerShifts: Shift[];

  @IsObject()
  @IsOptional()
  @ApiProperty({ nullable: true, type: EmployerData })
  employerData?: EmployerData;

  @IsArray()
  @ApiProperty()
  offersOwnedByEmployer: Offer[];

  @IsArray()
  @IsOptional()
  @ApiProperty()
  userImages?: UserImage[];

  @IsArray()
  @ApiProperty()
  clocksHistory: Clock[];

  @IsArray()
  @ApiProperty()
  address: Address[];
}
