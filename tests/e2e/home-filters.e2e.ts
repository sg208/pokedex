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

test('flying chip lists slot-2 members like Charizard and slot-1 like Pidgey', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .locator('ul[aria-label="Filter by type"]')
    .getByRole('button', { name: 'flying' })
    .click();
  await expect(page.locator('a[href="/pokemon/charizard"]')).toBeVisible();
  await expect(page.locator('a[href="/pokemon/pidgey"]')).toBeVisible();
});

test('type filter lives in the URL: load, reload and back navigation', async ({
  page,
}) => {
  const chip = page
    .locator('ul[aria-label="Filter by type"]')
    .getByRole('button', { name: 'flying' });

  await page.goto('/?type=flying');
  await expect(chip).toHaveAttribute('aria-pressed', 'true');

  await page.reload();
  await expect(chip).toHaveAttribute('aria-pressed', 'true');

  await page.locator('a[href="/pokemon/pidgey"]').click();
  await expect(page).toHaveURL(/\/pokemon\/pidgey$/);
  await page.goBack();
  await expect(page).toHaveURL(/type=flying/);
  await expect(chip).toHaveAttribute('aria-pressed', 'true');
});

test('search folds accents, punctuation and gender signs', async ({ page }) => {
  await page.goto('/');
  const search = page.getByPlaceholder('Search by name or number');

  await search.fill('mr. mime');
  await expect(page.locator('a[href="/pokemon/mr-mime"]')).toBeVisible();

  await search.fill('flabébé');
  await expect(page.locator('a[href="/pokemon/flabebe"]')).toBeVisible();

  await search.fill('nidoran♀');
  await expect(page.locator('a[href="/pokemon/nidoran-f"]')).toBeVisible();
});
