import { Page, expect } from '@playwright/test';
import { parseMoney } from './money';

export class InventoryPage {
  constructor(private readonly page: Page) {}

  get title() {
    return this.page.getByTestId('title');
  }

  get cartBadge() {
    return this.page.getByTestId('shopping-cart-badge');
  }

  /** Adds a product by visible name and returns its listed price (read from the UI, not hard-coded). */
  async addToCart(productName: string): Promise<number> {
    const card = this.page.getByTestId('inventory-item').filter({ hasText: productName });
    const price = parseMoney(await card.getByTestId('inventory-item-price').innerText());
    await card.getByRole('button', { name: 'Add to cart' }).click();
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
    return price;
  }

  async openCart() {
    await this.page.getByTestId('shopping-cart-link').click();
  }
}
