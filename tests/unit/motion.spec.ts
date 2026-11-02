import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Protects: motion stays transform/opacity only, never `transition: all`, and a
// reduced-motion fallback sits beside it. There is no seam to test feel itself
// (motion not viewed), so this pins the rules a reviewer would check by eye.
const css = readFileSync('assets/css/main.css', 'utf8');
const sources = ['components', 'pages', 'layouts', 'assets/css'].flatMap(
  (dir) =>
    readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(vue|css)$/.test(entry.name))
      .map((entry) => readFileSync(`${entry.parentPath}/${entry.name}`, 'utf8'))
);

describe('motion rules', () => {
  it('never transitions all properties', () => {
    sources.forEach((source) => {
      expect(source).not.toMatch(/transition(-property)?:\s*all/);
    });
  });

  it('removes transitions and entrance offsets under prefers-reduced-motion', () => {
    const block =
      /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/.exec(
        css
      )?.[1] ?? '';
    expect(block).toContain('transition-duration');
    expect(block).toContain('.reveal-pending');
    expect(block).toContain('transform: none');
  });

  it('keeps the header ink switch at 300ms', () => {
    expect(css).toContain('--duration-chapter: 300ms');
    expect(css).toMatch(
      /\.site-header \{[\s\S]*?transition-duration: var\(--duration-chapter\)/
    );
  });

  it('gives buttons a press scale and cards a hover lift under no-preference', () => {
    expect(css).toMatch(/button:active[\s\S]*?scale\(/);
    const card = readFileSync('components/PokemonCard.vue', 'utf8');
    expect(card).toMatch(
      /@media \(prefers-reduced-motion: no-preference\)[\s\S]*?translateY\(-/
    );
  });
});
