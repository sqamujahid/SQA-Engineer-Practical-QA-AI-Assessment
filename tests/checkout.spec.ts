import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { round2 } from '../pages/money';

const USER = process.env.SAUCE_USER ?? 'standard_user';
const PASS = process.env.SAUCE_PASS ?? 'secret_sauce';
const TAX_RATE = 0.08; // observed on the app; confirm with the product owner before relying on it

const PRODUCTS = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
const CUSTOMER = { firstName: 'Test', lastName: 'User', postalCode: '44000' };

test.describe('Checkout', () => {
  // Each test gets a fresh browser context, so cart state (localStorage) never leaks between tests.
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USER, PASS);
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('standard_user completes checkout with two items and correct totals', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    // Add items; prices come from the UI so the test survives price changes.
    const prices: number[] = [];
    for (const name of PRODUCTS) prices.push(await inventory.addToCart(name));
    await expect(inventory.cartBadge).toHaveText(String(PRODUCTS.length));

    // Cart contains exactly what we added
    await inventory.openCart();
    await expect(cart.title).toHaveText('Your Cart');
    await expect(cart.itemNames).toHaveText(PRODUCTS);

    // Customer info
    await cart.checkout();
    await expect(checkout.title).toHaveText('Checkout: Your Information');
    await checkout.fillCustomer(CUSTOMER);
    await checkout.continue();

    // Overview: independently recompute subtotal, tax, total
    await expect(checkout.title).toHaveText('Checkout: Overview');
    const expectedSubtotal = round2(prices.reduce((a, b) => a + b, 0));
    const expectedTax = round2(expectedSubtotal * TAX_RATE);
    const { subtotal, tax, total } = await checkout.totals();
    expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(tax).toBeCloseTo(expectedTax, 2);
    expect(total).toBeCloseTo(round2(expectedSubtotal + expectedTax), 2);

    // Complete
    await checkout.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkout.confirmationHeader).toHaveText('Thank you for your order!');
    // Cart is emptied after a successful order
    await expect(inventory.cartBadge).toHaveCount(0);
  });

  test('checkout form requires first name, last name and postal code', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await inventory.addToCart(PRODUCTS[0]);
    await inventory.openCart();
    await cart.checkout();

    await checkout.continue();
    await expect(checkout.error).toContainText('First Name is required');

    await checkout.fillCustomer({ ...CUSTOMER, firstName: '' });
    await checkout.continue();
    await expect(checkout.error).toContainText('First Name is required');

    await checkout.fillCustomer({ ...CUSTOMER, postalCode: '' });
    await checkout.continue();
    await expect(page).toHaveURL(/checkout-step-one\.html/); // must not advance
  });

  // Documents DEFECT-1 (see report). Marked test.fail so the suite stays green while the bug exists
  // and turns red (alerting us to remove the annotation) once it is fixed.
  test('should not allow checkout with an empty cart', async ({ page }) => {
    test.fail(true, 'DEFECT-1: app allows checkout with 0 items');
    await page.goto('/cart.html');
    await new CartPage(page).checkout();
    await expect(page).not.toHaveURL(/checkout-step-one\.html/);
  });
});
