import { Page } from '@playwright/test';
import { parseMoney } from './money';

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  get title() {
    return this.page.getByTestId('title');
  }

  get error() {
    return this.page.getByTestId('error');
  }

  get confirmationHeader() {
    return this.page.getByTestId('complete-header');
  }

  async fillCustomer(c: Customer) {
    await this.page.getByTestId('firstName').fill(c.firstName);
    await this.page.getByTestId('lastName').fill(c.lastName);
    await this.page.getByTestId('postalCode').fill(c.postalCode);
  }

  async continue() {
    await this.page.getByTestId('continue').click();
  }

  async finish() {
    await this.page.getByTestId('finish').click();
  }

  async totals() {
    return {
      subtotal: parseMoney(await this.page.getByTestId('subtotal-label').innerText()),
      tax: parseMoney(await this.page.getByTestId('tax-label').innerText()),
      total: parseMoney(await this.page.getByTestId('total-label').innerText()),
    };
  }
}
