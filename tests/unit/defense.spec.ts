import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { DexIndex } from '~/types/pokemon';
import { groupWeaknesses, multiplierLabel } from '~/utils/defense';

const index = JSON.parse(
  readFileSync('public/data/dex-index.json', 'utf8')
) as DexIndex;

const bucketsOf = (name: string): Record<string, string[]> => {
  const mon = index.pokemon.find((entry) => entry.name === name)!;
  return Object.fromEntries(
    groupWeaknesses(mon.types, mon.abilities, index).map((bucket) => [
      bucket.label,
      bucket.types,
    ])
  );
};

describe('multiplierLabel', () => {
  it.each([
    [4, '×4'],
    [2, '×2'],
    [0.5, '×½'],
    [0.25, '×¼'],
    [0, '×0'],
  ])('labels %s as %s', (value, label) => {
    expect(multiplierLabel(value)).toBe(label);
  });
});

describe('groupWeaknesses', () => {
  it('always returns the five buckets in order, even when empty', () => {
    const mon = index.pokemon.find((entry) => entry.name === 'pikachu')!;
    const buckets = groupWeaknesses(mon.types, mon.abilities, index);
    expect(buckets.map((bucket) => bucket.label)).toEqual([
      '×4',
      '×2',
      '×½',
      '×¼',
      '×0',
    ]);
  });

  it('puts Ground at ×2 for Pikachu and leaves ×4 and ×0 empty', () => {
    const buckets = bucketsOf('pikachu');
    expect(buckets['×2']).toEqual(['ground']);
    expect(buckets['×4']).toEqual([]);
    expect(buckets['×0']).toEqual([]);
    expect(buckets['×½']).toEqual(['flying', 'steel', 'electric']);
  });

  it('finds a ×4 weakness and a ×¼ resistance', () => {
    expect(bucketsOf('charizard')['×4']).toEqual(['rock']);
    expect(bucketsOf('charizard')['×¼']).toEqual(['bug', 'grass']);
  });

  it('makes Rotom immune to Ground through Levitate', () => {
    const buckets = bucketsOf('rotom');
    expect(buckets['×0']).toContain('ground');
    expect(buckets['×2']).not.toContain('ground');
  });

  it('keeps an ability that is not guaranteed out of the grid', () => {
    // Growlithe has Intimidate or Flash Fire, so Fire is only resisted, not immune
    const buckets = bucketsOf('growlithe');
    expect(buckets['×0']).toEqual([]);
    expect(buckets['×½']).toContain('fire');
  });

  it('shows Shedinja at ×2 on five types and ×0 on the rest', () => {
    const buckets = bucketsOf('shedinja');
    expect([...buckets['×2']!].sort()).toEqual(
      ['dark', 'fire', 'flying', 'ghost', 'rock'].sort()
    );
    expect(buckets['×0']).toHaveLength(13);
    expect(buckets['×4']).toEqual([]);
    expect(buckets['×½']).toEqual([]);
    expect(buckets['×¼']).toEqual([]);
  });
});
