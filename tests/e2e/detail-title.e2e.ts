import { expect, test } from '@playwright/test';

const SLUGS = [
  'charmander',
  'mewtwo',
  'crabominable',
  'fletchinder',
  'mr-mime',
  'tapu-koko',
  'mamoswine',
  'wormadam-plant',
];
const VIEWPORTS = [
  { width: 1287, height: 900 },
  { width: 1024, height: 800 },
  { width: 390, height: 844 },
];

for (const viewport of VIEWPORTS) {
  for (const slug of SLUGS) {
    test(`${slug} title keeps words whole at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(`/pokemon/${slug}`);
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toHaveClass(/reveal-in/);
      await page.evaluate(() => document.fonts.ready);

      const metrics = await heading.evaluate((element) => {
        const text = element.firstChild as Text;
        const content = text.data;
        const tops = (start: number, end: number): number[] => {
          const found: number[] = [];
          for (let i = start; i < end; i += 1) {
            const range = document.createRange();
            range.setStart(text, i);
            range.setEnd(text, i + 1);
            const rect = range.getClientRects()[0];
            if (rect) found.push(Math.round(rect.top));
          }
          return found;
        };
        const words: { word: string; spread: number }[] = [];
        const pattern = /\S+/g;
        let match = pattern.exec(content);
        while (match) {
          const found = tops(match.index, match.index + match[0].length);
          words.push({
            word: match[0],
            spread: Math.max(...found) - Math.min(...found),
          });
          match = pattern.exec(content);
        }
        const lineTops = new Set(tops(0, content.length));
        return {
          words,
          lineCount: lineTops.size,
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          fontStretch: getComputedStyle(element).fontStretch,
        };
      });

      for (const entry of metrics.words) {
        expect(
          entry.spread,
          `${entry.word} broke mid-word`
        ).toBeLessThanOrEqual(1);
      }
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
      expect(metrics.lineCount).toBeLessThanOrEqual(2);
      expect(metrics.fontStretch).toContain('150%');
    });
  }
}
