import { describe, it, expect } from 'vitest';
import {
  PAGE_SIZE,
  buildPrimaryTypeIndex,
  filterDex,
  getNextOffset,
  parseDexEntries,
} from '~/utils/dex';

const entries = [
  { id: 1, name: 'bulbasaur' },
  { id: 4, name: 'charmander' },
  { id: 25, name: 'pikachu' },
  { id: 122, name: 'mr-mime' },
];
const typeIndex = new Map([
  [1, 'grass'],
  [4, 'fire'],
  [25, 'electric'],
  [122, 'psychic'],
]);

describe('filterDex', () => {
  it('filters by name query, ignoring case and hyphens', () => {
    expect(
      filterDex(entries, { query: 'CHAR', type: null, typeIndex })
    ).toEqual([{ id: 4, name: 'charmander' }]);
    expect(
      filterDex(entries, { query: 'mr mime', type: null, typeIndex })
    ).toEqual([{ id: 122, name: 'mr-mime' }]);
  });

  it('matches a dex number', () => {
    expect(filterDex(entries, { query: '#25', type: null, typeIndex })).toEqual(
      [{ id: 25, name: 'pikachu' }]
    );
  });

  it('filters by type', () => {
    expect(filterDex(entries, { query: '', type: 'fire', typeIndex })).toEqual([
      { id: 4, name: 'charmander' },
    ]);
  });

  it('intersects query and type', () => {
    expect(
      filterDex(entries, { query: 'a', type: 'electric', typeIndex })
    ).toEqual([{ id: 25, name: 'pikachu' }]);
    expect(
      filterDex(entries, { query: 'char', type: 'grass', typeIndex })
    ).toEqual([]);
  });

  it('returns everything with no filters and [] for no match', () => {
    expect(
      filterDex(entries, { query: '  ', type: null, typeIndex })
    ).toHaveLength(4);
    expect(filterDex(entries, { query: 'zzz', type: null, typeIndex })).toEqual(
      []
    );
  });
});

describe('getNextOffset', () => {
  it('steps by the page size', () => {
    expect(getNextOffset({ offset: 0, limit: PAGE_SIZE })).toEqual({
      offset: 24,
      limit: 24,
    });
  });

  it('shortens the last page to 17 at offset 1008, then stops', () => {
    expect(getNextOffset({ offset: 984, limit: 24 })).toEqual({
      offset: 1008,
      limit: 17,
    });
    expect(getNextOffset({ offset: 1008, limit: 17 })).toBeUndefined();
  });
});

describe('parseDexEntries', () => {
  it('maps results to ids and drops ids above 1025', () => {
    const results = [
      { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
      {
        name: 'pikachu-cosplay',
        url: 'https://pokeapi.co/api/v2/pokemon/10080/',
      },
    ];
    expect(parseDexEntries(results)).toEqual([{ id: 25, name: 'pikachu' }]);
  });
});

describe('buildPrimaryTypeIndex', () => {
  it('maps ids to their slot 1 type only, capped at 1025', () => {
    const url = (id: number): string =>
      `https://pokeapi.co/api/v2/pokemon/${id}/`;
    const index = buildPrimaryTypeIndex([
      {
        name: 'grass',
        pokemon: [
          { slot: 1, pokemon: { name: 'bulbasaur', url: url(1) } },
          { slot: 1, pokemon: { name: 'form', url: url(10001) } },
        ],
      },
      {
        name: 'poison',
        pokemon: [{ slot: 2, pokemon: { name: 'bulbasaur', url: url(1) } }],
      },
    ]);
    expect(index.get(1)).toBe('grass');
    expect(index.size).toBe(1);
  });
});
