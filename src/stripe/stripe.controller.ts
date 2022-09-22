import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

import {
  CardDto,
  CreateCustomerDto,
  CreateTransferDto,
  CreateUserAccDto,
  PaymentIntentDto,
  UpdateCustomerDto,
  UpdateUserAccDto,
} from './stripe.dto';
import { StripeService } from './stripe.service';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('user-account/:id')
  @ApiOperation({ summary: 'Retrieve an user account' })
  getUser(@Param('id') id: string) {
    return this.stripeService.retrieveAccount(id);
  }

  @Post('create-user-acc')
  @ApiOperation({ summary: 'Create an user account for workers' })
  createUser(@Body() payload: CreateUserAccDto) {
    const userDataObj = {
      type: 'custom',
      country: 'US',
      email: 'jane.doe@example.com',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        first_name: 'Jane',
        last_name: 'Doe',
        ssn_last_4: '0000',
        address: {
          line1: 'address_full_match',
          postal_code: '35802',
          city: 'Huntsville',
          state: 'Alabama',
        },
        dob: {
          day: 31,
          month: 12,
          year: 1994,
        },
        email: 'jane.doe@example.com',
        phone: '+14082684525',
      },
      external_account: {
        object: 'bank_account',
        country: 'US',
        currency: 'usd',
        routing_number: '110000000',
        account_number: '000123456789',
      },
      tos_acceptance: { date: Math.floor(Date.now() / 1000), ip: '8.8.8.8' },
      business_profile: {
        mcc: '7011',
        url: 'www.asd.com',
      },
    };
    return this.stripeService.createUserAccount(payload);
  }

  @Put('user-account/:id')
  @ApiOperation({ summary: 'Update user account information' })
  updateUser(@Param('id') id: string, @Body() payload: UpdateUserAccDto) {
    return this.stripeService.updateAccount(id, payload);
  }

  @Delete('user-account/:id')
  @ApiOperation({ summary: 'Delete an user account' })
  delete(@Param('id') id: string) {
    return this.stripeService.deleteAccount(id);
  }

  @Get('customer/:id')
  @ApiOperation({ summary: 'Retrieves a Customer object' })
  getCustomer(@Param('id') id: string) {
    return this.stripeService.retrieveCustomer(id);
  }

  @Post('create-customer')
  @ApiOperation({ summary: 'Create a Customer for employers' })
  createCustomer(@Body() payload: CreateCustomerDto) {
    return this.stripeService.createCustomer(payload);
  }

  @Put('customer/:id')
  @ApiOperation({ summary: 'Update customer information' })
  updateCustomer(@Param('id') id: string, @Body() payload: UpdateCustomerDto) {
    return this.stripeService.updateCustomer(id, payload);
  }

  @Delete('customer/:id')
  @ApiOperation({ summary: 'Delete a customer' })
  deleteCustomer(@Param('id') id: string) {
    return this.stripeService.deleteCustomer(id);
  }

  @Get(':customerId/payment-method')
  @ApiOperation({
    summary: 'Retrieves a PaymentMethod object for a given Customer',
  })
  getPaymentMethod(@Param('customerId') customerId: string) {
    return this.stripeService.retrievePaymentMethod(customerId);
  }

  @Post(':customerId/payment-method')
  @ApiOperation({ summary: 'Create a payment method for a customer' })
  createPaymentMethod(
    @Param('customerId') customerId: string,
    @Body() payload: CardDto,
  ) {
    return this.stripeService.createPaymentMethod(customerId, payload);
  }

  @Post('payment-intent')
  @ApiOperation({
    summary: 'Create a PaymentIntent to collect a payment from a customer',
  })
  createPaymentIntent(@Body() payload: PaymentIntentDto) {
    return this.stripeService.createPaymentIntent(payload);
  }

  @Post('transfer')
  @ApiOperation({
    summary: 'To send funds from Stripe to a connected account (worker)',
  })
  createTransfer(@Body() payload: CreateTransferDto) {
    return this.stripeService.createTransfer(payload);
  }
}
