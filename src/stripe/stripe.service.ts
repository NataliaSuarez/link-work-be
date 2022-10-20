import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CardDto,
  CreateCustomerDto,
  CreateTransferDto,
  CreateUserAccDto,
  PaymentIntentDto,
  UpdateCustomerDto,
  UpdateUserAccDto,
} from './stripe.dto';
import * as dotenv from 'dotenv';
dotenv.config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

@Injectable()
export class StripeService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  async createUserAccount(data: CreateUserAccDto) {
    const account = await stripe.accounts.create(data);
    return account;
  }

  async retrieveAccount(accountId) {
    const account = await stripe.accounts.retrieve(accountId);
    return account;
  }

  async updateAccount(id: string, changes: UpdateUserAccDto) {
    const account = await stripe.accounts.update(id, changes);
    return account;
  }

  async deleteAccount(id: string) {
    const deleted = await stripe.accounts.del(id);
    return deleted;
  }

  async createCustomer(data: CreateCustomerDto) {
    const customer = await stripe.customers.create(data);
    return customer;
  }

  async retrieveCustomer(customerId) {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  }

  async updateCustomer(id: string, changes: UpdateCustomerDto) {
    const customer = await stripe.customers.update(id, changes);
    return customer;
  }

  async deleteCustomer(id: string) {
    const deleted = await stripe.customers.del(id);
    return deleted;
  }

  async createPaymentMethod(customerId: string, data: CardDto) {
    const customer = await stripe.customers.retrieve(customerId);
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: data,
    });
    const updateMethod = await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customerId,
    });
    const updatedCustomer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });
    return paymentMethod;
  }

  async retrievePaymentMethod(customerId) {
    const paymentMethods = await stripe.customers.listPaymentMethods(
      customerId,
      { type: 'card' },
    );
    return paymentMethods;
  }

  async updatePaymentMethod(customerId: string, data: CardDto) {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: data,
    });
    const oldPaymentMethod = await this.retrievePaymentMethod(customerId);
    await stripe.paymentMethods.detach(oldPaymentMethod.data[0].id);
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: customerId,
    });
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });
    return paymentMethod;
  }

  async createPaymentIntent(data: PaymentIntentDto) {
    const paymentIntent = await stripe.paymentIntents.create(data);
    return paymentIntent;
  }

  async createTransfer(data: CreateTransferDto) {
    const transfer = await stripe.transfers.create(data);
    return transfer;
  }
}
