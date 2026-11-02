import { describe, expect, it } from 'vitest';
import {
  SORT_KEYS,
  filterByTraits,
  isSortKey,
  sortEntries,
} from '~/utils/dexSort';

const mon = (
  id: number,
  stats: number[],
  extra: {
    generation?: number;
    isLegendary?: boolean;
    isMythical?: boolean;
  } = {}
): {
  id: number;
  stats: number[];
  bst: number;
  generation: number;
  isLegendary: boolean;
  isMythical: boolean;
} => ({
  id,
  stats,
  bst: stats.reduce((sum, value) => sum + value, 0),
  generation: extra.generation ?? 1,
  isLegendary: extra.isLegendary ?? false,
  isMythical: extra.isMythical ?? false,
});

// hp, attack, defense, special-attack, special-defense, speed
const snapshot = {
  pokemon: [
    mon(1, [10, 20, 30, 40, 50, 60]),
    mon(2, [60, 50, 40, 30, 20, 10]),
    mon(3, [10, 20, 30, 40, 50, 60]),
    mon(4, [70, 5, 5, 5, 5, 5], { generation: 2, isLegendary: true }),
    mon(5, [1, 1, 1, 1, 1, 1], { generation: 2, isMythical: true }),
  ],
};
const entries = snapshot.pokemon.map((entry) => ({
  id: entry.id,
  name: `p${entry.id}`,
}));
const ids = (list: { id: number }[]): number[] => list.map((entry) => entry.id);

describe('sortEntries', () => {
  it('sorts each stat and the total, descending, with ties by id', () => {
    expect(ids(sortEntries(entries, snapshot, 'hp', 'desc'))).toEqual([
      4, 2, 1, 3, 5,
    ]);
    expect(ids(sortEntries(entries, snapshot, 'attack', 'desc'))).toEqual([
      2, 1, 3, 4, 5,
    ]);
    expect(ids(sortEntries(entries, snapshot, 'defense', 'desc'))).toEqual([
      2, 1, 3, 4, 5,
    ]);
    expect(
      ids(sortEntries(entries, snapshot, 'special-attack', 'desc'))
    ).toEqual([1, 3, 2, 4, 5]);
    expect(
      ids(sortEntries(entries, snapshot, 'special-defense', 'desc'))
    ).toEqual([1, 3, 2, 4, 5]);
    expect(ids(sortEntries(entries, snapshot, 'speed', 'desc'))).toEqual([
      1, 3, 2, 4, 5,
    ]);
    expect(ids(sortEntries(entries, snapshot, 'total', 'desc'))).toEqual([
      1, 2, 3, 4, 5,
    ]);
  });

  it('sorts ascending and keeps ties in id order', () => {
    expect(ids(sortEntries(entries, snapshot, 'speed', 'asc'))).toEqual([
      5, 4, 2, 1, 3,
    ]);
    expect(ids(sortEntries(entries, snapshot, 'total', 'asc'))).toEqual([
      5, 4, 1, 2, 3,
    ]);
  });

  it('does not mutate its input and drops nothing', () => {
    const copy = [...entries];
    sortEntries(entries, snapshot, 'hp', 'asc');
    expect(entries).toEqual(copy);
    expect(sortEntries(entries, snapshot, 'hp', 'asc')).toHaveLength(5);
  });
});

describe('filterByTraits', () => {
  it('filters by generation', () => {
    expect(
      ids(filterByTraits(entries, snapshot, { gen: 2, rarity: null }))
    ).toEqual([4, 5]);
  });

  it('filters by rarity', () => {
    expect(
      ids(filterByTraits(entries, snapshot, { gen: null, rarity: 'legendary' }))
    ).toEqual([4]);
    expect(
      ids(filterByTraits(entries, snapshot, { gen: null, rarity: 'mythical' }))
    ).toEqual([5]);
  });

  it('combines both and passes everything through with neither', () => {
    expect(
      ids(filterByTraits(entries, snapshot, { gen: 1, rarity: 'legendary' }))
    ).toEqual([]);
    expect(
      ids(filterByTraits(entries, snapshot, { gen: null, rarity: null }))
    ).toHaveLength(5);
  });
});

describe('isSortKey', () => {
  it('accepts the six stats and total only', () => {
    expect(SORT_KEYS).toHaveLength(7);
    expect(isSortKey('special-attack')).toBe(true);
    expect(isSortKey('total')).toBe(true);
    expect(isSortKey('bogus')).toBe(false);
    expect(isSortKey(null)).toBe(false);
  });
});
