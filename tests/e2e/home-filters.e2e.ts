import { expect, test } from '@playwright/test';

test('search narrows the grid and shows an empty state', async ({ page }) => {
  await page.goto('/');
  const search = page.getByPlaceholder('Search by name or number');

  await search.fill('zzzzqqq');
  await expect(page.getByText('No Pokémon match that search')).toBeVisible();

  await search.fill('');
  await search.fill('pika');
  await expect(page.locator('a[href="/pokemon/pikachu"]')).toBeVisible();
});

test('type chip toggles from the keyboard', async ({ page }) => {
  await page.goto('/');
  const chip = page
    .locator('ul[aria-label="Filter by type"]')
    .getByRole('button', { name: 'fire' });

  await chip.focus();
  await expect(chip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Enter');
  await expect(chip).toHaveAttribute('aria-pressed', 'false');
});
