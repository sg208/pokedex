import { expect, test } from '@playwright/test';

test('home grid shows 24 cards and loads more', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('ul a[href^="/pokemon/"]');
  await expect(cards).toHaveCount(24);

  const loadMore = page.getByRole('button', { name: 'Load more' });
  await loadMore.scrollIntoViewIfNeeded();
  await expect.poll(() => cards.count()).toBeGreaterThan(24);
});
