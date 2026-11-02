import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

interface HeaderBlock {
  path: string;
  headers: Record<string, string>;
}

const MAX_RULES = 100;
const MAX_LINE = 2000;

const source = readFileSync(resolve(process.cwd(), 'public/_headers'), 'utf8');
const lines = source.split('\n');

// Cloudflare format: unindented line = URL pattern, indented `Name: value` = header
const parseHeaders = (text: string): HeaderBlock[] => {
  const blocks: HeaderBlock[] = [];
  for (const line of text.split('\n')) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      blocks.push({ path: line.trim(), headers: {} });
      continue;
    }
    const current = blocks.at(-1);
    const separator = line.indexOf(':');
    if (!current || separator === -1) throw new Error(`Bad line: ${line}`);
    current.headers[line.slice(0, separator).trim().toLowerCase()] = line
      .slice(separator + 1)
      .trim();
  }
  return blocks;
};

const blocks = parseHeaders(source);
const find = (path: string): HeaderBlock | undefined =>
  blocks.find((block) => block.path === path);

describe('public/_headers', () => {
  it('sets security headers for every path', () => {
    const all = find('/*')?.headers ?? {};
    expect(all['strict-transport-security']).toBe('max-age=31536000');
    expect(all['strict-transport-security']).not.toMatch(
      /includeSubDomains|preload/i
    );
    expect(all['x-content-type-options']).toBe('nosniff');
    expect(all['referrer-policy']).toBeTruthy();
    expect(all['x-frame-options']).toBe('DENY');
    expect(all['permissions-policy']).toBeTruthy();
  });

  it('only ever reports CSP, never enforces it', () => {
    const all = find('/*')?.headers ?? {};
    expect(all['content-security-policy-report-only']).toContain(
      "default-src 'self'"
    );
    for (const block of blocks) {
      expect(Object.keys(block.headers)).not.toContain(
        'content-security-policy'
      );
    }
  });

  it('caches hashed build assets as immutable', () => {
    expect(find('/_nuxt/*')?.headers).toEqual({
      'cache-control': 'public, max-age=31536000, immutable',
    });
  });

  it('stays within Cloudflare limits', () => {
    const ruleCount = lines.filter(
      (line) => line.trim() && !line.trim().startsWith('#')
    ).length;
    expect(ruleCount).toBeLessThanOrEqual(MAX_RULES);
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(MAX_LINE);
    }
  });

  it('parser catches a bad file (guards the checks above)', () => {
    expect(() => parseHeaders('/*\n  no-colon')).toThrow();
    expect(parseHeaders('/a\n  X: 1')[0]?.headers).toEqual({ x: '1' });
  });
});
