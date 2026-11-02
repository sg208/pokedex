import { expect, test } from '@playwright/test';

const evolutions = 'section:has(h2:text-is("Evolutions"))';

test('Eevee shows 8 evolution links with method text', async ({ page }) => {
  await page.goto('/pokemon/eevee');
  const branches = page.locator(`${evolutions} ul ul li > a`);
  await expect(branches).toHaveCount(8);
  await expect(branches.first()).toContainText('Evolves by');
  await expect(
    page.locator(`${evolutions} a[aria-current="page"]`)
  ).toHaveCount(1);
});

test('Meowth shows Perrserker with its region note', async ({ page }) => {
  await page.goto('/pokemon/meowth');
  const perrserker = page.locator(
    `${evolutions} a[href="/pokemon/perrserker"]`
  );
  await expect(perrserker).toBeVisible();
  await expect(perrserker).toContainText('Galarian Meowth only');
  await expect(
    page.locator(`${evolutions} a[href="/pokemon/persian"]`)
  ).not.toContainText('only');
});

test('Eevee stays inside a 390px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pokemon/eevee');
  const branches = page.locator(`${evolutions} ul ul li > a`);
  await expect(branches).toHaveCount(8);
  const boxes = await branches.evaluateAll((links) =>
    links.map((link) => link.getBoundingClientRect())
  );
  // one column: every card starts at the same left edge and below the previous one
  boxes.forEach((box, position) => {
    expect(box.left).toBeCloseTo(boxes[0]!.left, 0);
    expect(box.right).toBeLessThanOrEqual(390);
    if (position > 0) {
      expect(box.top).toBeGreaterThanOrEqual(boxes[position - 1]!.bottom - 1);
    }
  });
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
