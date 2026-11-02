import { expect, test } from '@playwright/test';

test('evolution link from Toxel reaches Toxtricity amped form', async ({
  page,
  request,
}) => {
  // The prerendered shell exists, so a direct load is a real 200, not a 404
  const shell = await request.get('/pokemon/toxtricity-amped');
  expect(shell.status()).toBe(200);

  await page.goto('/pokemon/toxel');
  const link = page
    .locator('section', {
      has: page.getByRole('heading', { name: 'Evolutions' }),
    })
    .locator('a[href="/pokemon/toxtricity-amped"]');
  await expect(link).toBeVisible();
  await link.click();

  await expect(page).toHaveURL(/\/pokemon\/toxtricity-amped$/);
  await expect(page.locator('h1')).toHaveText(/toxtricity/i);
  await expect(page.getByText('Page not found')).toHaveCount(0);
});
