import { Page } from '@playwright/test';

export class CartPage {
  constructor(private readonly page: Page) {}

  get title() {
    return this.page.getByTestId('title');
  }

  get itemNames() {
    return this.page.getByTestId('inventory-item-name');
  }

  async checkout() {
    await this.page.getByTestId('checkout').click();
  }
}
