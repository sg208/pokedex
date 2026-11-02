import { expect, test } from '@playwright/test';

test('detail page shows name and number', async ({ page }) => {
  await page.goto('/pokemon/pikachu');
  await expect(page.locator('h1')).toContainText(/pikachu/i);
  await expect(page.getByText('#0025').first()).toBeVisible();
});

test('unknown pokemon shows the error page', async ({ page }) => {
  const response = await page.goto('/pokemon/nope');
  // serve@14 answers unknown paths with 404.html (observed status 404)
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
});
