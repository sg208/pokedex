import { expect, test } from '@playwright/test';

test.describe('detail page panel', () => {
  test('the game select changes the flavor text', async ({ page }) => {
    await page.goto('/pokemon/pikachu');
    const select = page.getByLabel('Game');
    await expect(select).toBeVisible();
    const flavor = page.locator(
      '.detail-name select + p, .detail-name div > p'
    );
    const before = await page.locator('.detail-name').innerText();
    const options = await select.locator('option').allTextContents();
    expect(options.length).toBeGreaterThan(1);
    await select.selectOption({ index: 0 });
    await expect(page.locator('.detail-name')).not.toHaveText(before);
    await expect(flavor.first()).toBeVisible();
  });

  test('the shiny toggle swaps the artwork', async ({ page }) => {
    await page.goto('/pokemon/pikachu');
    const toggle = page.getByRole('button', { name: 'Shiny' });
    const art = page.locator('img.detail-art');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(art).toHaveAttribute('src', /\/shiny\//);
  });

  test('shows the data panel and never autoplays a cry', async ({ page }) => {
    await page.goto('/pokemon/pikachu');
    await expect(page.getByText('Catch rate', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Base stat total', { exact: true })
    ).toBeVisible();
    await expect(page.locator('audio[autoplay]')).toHaveCount(0);
  });
});
