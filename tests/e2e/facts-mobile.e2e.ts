import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });

test('Base experience label stays on one line and inside its box at 390px', async ({
  page,
}) => {
  await page.goto('/pokemon/pikachu');
  const label = page.locator('dt', { hasText: 'Base experience' });
  await expect(label).toBeVisible();

  const metrics = await label.evaluate((element) => {
    const style = getComputedStyle(element);
    const fontSize = parseFloat(style.fontSize);
    const lineHeight =
      style.lineHeight === 'normal'
        ? fontSize * 1.2
        : parseFloat(style.lineHeight);
    return {
      height: element.getBoundingClientRect().height,
      lineHeight,
      overflows: element.scrollWidth > element.clientWidth,
      rootOverflows:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    };
  });
  expect(metrics.height).toBeLessThanOrEqual(metrics.lineHeight * 1.5);
  expect(metrics.overflows).toBe(false);
  expect(metrics.rootOverflows).toBe(false);
});
