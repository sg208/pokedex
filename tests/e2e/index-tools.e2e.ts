import { expect, test } from '@playwright/test';

interface SnapshotMon {
  id: number;
  name: string;
  stats: number[];
}

test('generation and rarity narrow the grid from the URL', async ({ page }) => {
  await page.goto('/?gen=1&rarity=legendary');
  await expect(page.locator('a[href="/pokemon/articuno"]')).toBeVisible();
  await expect(page.locator('a[href="/pokemon/mewtwo"]')).toBeVisible();
  await expect(page.locator('a[href="/pokemon/mew"]')).toHaveCount(0);
  await expect(page.getByLabel('Generation')).toHaveValue('1');
  await expect(page.getByLabel('Rarity')).toHaveValue('legendary');
});

test('sort by speed puts the fastest Pokémon first', async ({
  page,
  request,
}) => {
  const response = await request.get('/data/dex-index.json');
  const { pokemon } = (await response.json()) as { pokemon: SnapshotMon[] };
  // Speed is the sixth stat; ties go to the lower dex number
  const fastest = pokemon.reduce((best, mon) =>
    (mon.stats[5] ?? 0) > (best.stats[5] ?? 0) ? mon : best
  );

  await page.goto('/?sort=speed&dir=desc');
  await expect(page.locator('a[href^="/pokemon/"]').first()).toHaveAttribute(
    'href',
    `/pokemon/${fastest.name}`
  );
});

test('controls are keyboard operable and write to the URL; Clear resets', async ({
  page,
}) => {
  await page.goto('/');
  const sort = page.getByLabel('Sort by');
  await sort.focus();
  await expect(sort).toBeFocused();
  await sort.selectOption('speed');
  await expect(page).toHaveURL(/sort=speed/);

  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page).not.toHaveURL(/sort=/);
  await expect(sort).toHaveValue('');
});
