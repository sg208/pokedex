import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { TYPE_NAMES, getTypeStyle, typeChipStyle } from '~/utils/typeStyles';

const luminance = (hex: string): number => {
  const value = parseInt(hex.slice(1), 16);
  const [red = 0, green = 0, blue = 0] = [
    (value >> 16) & 255,
    (value >> 8) & 255,
    value & 255,
  ].map((channel) => {
    const scaled = channel / 255;
    return scaled <= 0.03928
      ? scaled / 12.92
      : ((scaled + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const contrast = (first: string, second: string): number => {
  const [light = 0, dark = 0] = [luminance(first), luminance(second)].sort(
    (left, right) => right - left
  );
  return (light + 0.05) / (dark + 0.05);
};

const css = readFileSync('assets/css/main.css', 'utf8');
const token = (name: string): string =>
  new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1] ?? '';

describe('type styles', () => {
  it('covers the 18 types', () => {
    expect(TYPE_NAMES).toHaveLength(18);
  });

  it.each([...TYPE_NAMES])(
    '%s ink on bg has contrast of at least 4.5',
    (name) => {
      const style = getTypeStyle(name);
      expect(style.bg).toMatch(/^#[0-9a-f]{6}$/);
      expect(contrast(style.bg, style.ink)).toBeGreaterThanOrEqual(4.5);
    }
  );

  it('falls back to a neutral pair for unknown types', () => {
    const style = getTypeStyle('shadow');
    expect(contrast(style.bg, style.ink)).toBeGreaterThanOrEqual(4.5);
  });

  it('builds a chip style from the type pair, swapped when inverted', () => {
    expect(typeChipStyle('fire')).toEqual({
      backgroundColor: '#ee8130',
      color: '#1a1a1a',
    });
    expect(typeChipStyle('fire', true)).toEqual({
      backgroundColor: '#1a1a1a',
      color: '#ee8130',
    });
  });

  it('uses the neutral pair for unknown or missing chip types', () => {
    const neutral = { backgroundColor: '#dcd5c5', color: '#1a1a1a' };
    expect(typeChipStyle('shadow')).toEqual(neutral);
    expect(typeChipStyle()).toEqual(neutral);
  });

  it('keeps hero token pairs readable', () => {
    expect(contrast(token('--ink'), token('--coral'))).toBeGreaterThanOrEqual(
      4.5
    );
    expect(contrast(token('--pale'), token('--coral'))).toBeGreaterThanOrEqual(
      3
    );
  });
});
