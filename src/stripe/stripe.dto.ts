import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateUserAccDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly type: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly country: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly email: string;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  readonly capabilities: {
    card_payments: { requested: boolean };
    transfers: { requested: boolean };
  };

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly business_type: string;

  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  readonly individual: {
    first_name: string;
    last_name: string;
    ssn_last_4: string;
    address: {
      line1: string;
      postal_code: string;
      city: string;
      state: string;
    };
    dob: {
      day: number;
      month: number;
      year: number;
    };
    email: string;
    phone: string;
  };

  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  external_account: {
    object: string;
    country: string;
    currency: string;
    routing_number: string;
    account_number: string;
  };

  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  tos_acceptance: {
    date: number;
    ip: string;
  };

  @IsObject()
  @IsNotEmpty()
  @ApiProperty()
  business_profile: {
    mcc: string;
    url: string;
  };
}

export class UpdateUserAccDto extends PartialType(CreateUserAccDto) {}

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly description: string;

  @IsOptional()
  @ApiProperty()
  readonly payment_method?: string;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

export class PaymentIntentDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly amount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly currency: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly customer: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly description: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly payment_method: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  readonly confirm: boolean;
}

export class CreateTransferDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly amount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly currency: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly destination: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly description: string;
}

export class CardDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly number: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly exp_month: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly exp_year: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly cvc: string;
}
