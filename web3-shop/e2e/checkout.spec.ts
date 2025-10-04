import { test, expect } from "@playwright/test";

test.describe("Checkout Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display empty cart message", async ({ page }) => {
    await page.click('a[href="/cart"]');
    await expect(page.locator("text=Your cart is empty")).toBeVisible();
  });

  test("should add product to cart", async ({ page }) => {
    await page.goto("/shop");
    
    // Wait for products to load
    await page.waitForSelector(".group", { timeout: 5000 });
    
    // Click first "Add to Cart" button
    const addToCartBtn = page.locator("button:has-text('Add to Cart')").first();
    await addToCartBtn.click();
    
    // Verify toast notification
    await expect(page.locator("text=Added to cart")).toBeVisible();
    
    // Check cart badge
    const cartBadge = page.locator('[href="/cart"] span');
    await expect(cartBadge).toHaveText("1");
  });

  test("should navigate to checkout", async ({ page }) => {
    // Add a product first
    await page.goto("/shop");
    await page.waitForSelector("button:has-text('Add to Cart')");
    await page.locator("button:has-text('Add to Cart')").first().click();
    
    // Go to cart
    await page.click('a[href="/cart"]');
    
    // Proceed to checkout
    await page.click("button:has-text('Proceed to Checkout')");
    
    // Verify on checkout page
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator("h1:has-text('Checkout')")).toBeVisible();
  });

  test("should require wallet connection for payment", async ({ page }) => {
    await page.goto("/checkout");
    
    // Should show wallet connection prompt
    await expect(
      page.locator("text=Connect your wallet to continue")
    ).toBeVisible();
  });
});

test.describe("Product Pages", () => {
  test("should display products on shop page", async ({ page }) => {
    await page.goto("/shop");
    
    await page.waitForSelector("h1:has-text('Shop All Products')");
    
    // Check for product cards or empty state
    const hasProducts = await page.locator(".group").count();
    
    if (hasProducts > 0) {
      expect(hasProducts).toBeGreaterThan(0);
    } else {
      await expect(page.locator("text=No products available")).toBeVisible();
    }
  });

  test("should display featured products on homepage", async ({ page }) => {
    await page.goto("/");
    
    await expect(page.locator("h1")).toContainText("Premium Birkenstock");
    await expect(page.locator("h2:has-text('Featured Products')")).toBeVisible();
  });
});
