import { describe, it, expect } from 'vitest';
import {
  PAGE_SIZE,
  buildPrimaryTypeIndex,
  buildTypeMembers,
  displayNameFor,
  filterDex,
  foldSearchText,
  getNextOffset,
  parseDexEntries,
  pokemonLabel,
} from '~/utils/dex';

const entries = [
  { id: 1, name: 'bulbasaur' },
  { id: 4, name: 'charmander' },
  { id: 25, name: 'pikachu' },
  { id: 122, name: 'mr-mime' },
];
const typeMembers = new Map([
  [1, ['grass', 'poison']],
  [4, ['fire']],
  [25, ['electric']],
  [122, ['psychic', 'fairy']],
]);

describe('filterDex', () => {
  it('filters by name query, ignoring case and hyphens', () => {
    expect(
      filterDex(entries, { query: 'CHAR', type: null, typeMembers })
    ).toEqual([{ id: 4, name: 'charmander' }]);
    expect(
      filterDex(entries, { query: 'mr mime', type: null, typeMembers })
    ).toEqual([{ id: 122, name: 'mr-mime' }]);
  });

  it('matches a dex number', () => {
    expect(
      filterDex(entries, { query: '#25', type: null, typeMembers })
    ).toEqual([{ id: 25, name: 'pikachu' }]);
  });

  it('filters by type', () => {
    expect(
      filterDex(entries, { query: '', type: 'fire', typeMembers })
    ).toEqual([{ id: 4, name: 'charmander' }]);
  });

  it('includes slot 2 members when filtering by type', () => {
    const ids = (type: string): number[] =>
      filterDex(entries, { query: '', type, typeMembers }).map(
        (entry) => entry.id
      );
    expect(ids('poison')).toEqual([1]);
    expect(ids('fairy')).toEqual([122]);
    expect(ids('grass')).toEqual([1]);
  });

  it('intersects query and type', () => {
    expect(
      filterDex(entries, { query: 'a', type: 'electric', typeMembers })
    ).toEqual([{ id: 25, name: 'pikachu' }]);
    expect(
      filterDex(entries, { query: 'char', type: 'grass', typeMembers })
    ).toEqual([]);
  });

  it('returns everything with no filters and [] for no match', () => {
    expect(
      filterDex(entries, { query: '  ', type: null, typeMembers })
    ).toHaveLength(4);
    expect(
      filterDex(entries, { query: 'zzz', type: null, typeMembers })
    ).toEqual([]);
  });
});

describe('foldSearchText', () => {
  it('lowercases, strips diacritics, maps gender signs and drops punctuation', () => {
    expect(foldSearchText('Flabébé')).toBe('flabebe');
    expect(foldSearchText('Nidoran♀')).toBe('nidoranf');
    expect(foldSearchText('Nidoran♂')).toBe('nidoranm');
    expect(foldSearchText('Farfetch’d')).toBe(foldSearchText("farfetch'd"));
    expect(foldSearchText('Mr. Mime')).toBe('mrmime');
    expect(foldSearchText('ho-oh')).toBe('hooh');
  });
});

describe('displayNameFor', () => {
  const index = { pokemon: [{ id: 1, displayName: 'Bulbasaur' }] };

  it('reads the snapshot entry by id', () => {
    expect(displayNameFor(index, 1)).toBe('Bulbasaur');
  });

  it('is undefined before the snapshot loads or for an unknown id', () => {
    expect(displayNameFor(undefined, 1)).toBeUndefined();
    expect(displayNameFor(index, 2)).toBeUndefined();
  });
});

describe('pokemonLabel', () => {
  const index = { pokemon: [{ id: 1, displayName: 'Bulbasaur' }] };

  it('prefers the snapshot display name', () => {
    expect(pokemonLabel(index, 1, 'bulbasaur')).toBe('Bulbasaur');
  });

  it('formats the slug before the snapshot loads', () => {
    expect(pokemonLabel(undefined, 122, 'mr-mime')).toBe('mr mime');
  });

  it('formats the slug when the id is missing from the snapshot', () => {
    expect(pokemonLabel(index, 2, 'ivysaur-x')).toBe('ivysaur x');
  });
});

describe('filterDex with display names', () => {
  const dex = [
    { id: 29, name: 'nidoran-f' },
    { id: 83, name: 'farfetchd' },
    { id: 122, name: 'mr-mime' },
    { id: 250, name: 'ho-oh' },
    { id: 641, name: 'tornadus-incarnate' },
    { id: 669, name: 'flabebe' },
  ];
  const displayNames = new Map([
    [29, 'Nidoran♀'],
    [83, 'Farfetch’d'],
    [122, 'Mr. Mime'],
    [250, 'Ho-Oh'],
    [641, 'Tornadus'],
    [669, 'Flabébé'],
  ]);
  const find = (query: string): number[] =>
    filterDex(dex, {
      query,
      type: null,
      typeMembers: new Map(),
      displayNames,
    }).map((entry) => entry.id);

  it.each([
    ['mr. mime', 122],
    ["farfetch'd", 83],
    ['flabébé', 669],
    ['nidoran♀', 29],
    ['ho oh', 250],
    ['tornadus', 641],
  ])('finds %s', (query, id) => {
    expect(find(query)).toEqual([id]);
  });

  it('keeps numeric search and finds nothing for a miss', () => {
    expect(find('#122')).toEqual([122]);
    expect(find('0083')).toEqual([83]);
    expect(find('zzz')).toEqual([]);
  });

  it('matches by slug alone when no display names are given', () => {
    expect(
      filterDex(dex, { query: 'tornadus', type: null, typeMembers: new Map() })
    ).toHaveLength(1);
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

describe('buildTypeMembers', () => {
  const url = (id: number): string =>
    `https://pokeapi.co/api/v2/pokemon/${id}/`;
  const members = buildTypeMembers([
    {
      name: 'flying',
      pokemon: [
        { slot: 2, pokemon: { name: 'charizard', url: url(6) } },
        { slot: 1, pokemon: { name: 'pidgey', url: url(16) } },
        { slot: 1, pokemon: { name: 'form', url: url(10001) } },
      ],
    },
    {
      name: 'fire',
      pokemon: [{ slot: 1, pokemon: { name: 'charizard', url: url(6) } }],
    },
  ]);

  it('maps ids to the types of both slots, capped at 1025', () => {
    expect(members.get(6)).toEqual(['flying', 'fire']);
    expect(members.get(16)).toEqual(['flying']);
    expect(members.size).toBe(2);
  });

  it('leaves the primary type index unchanged for card colour', () => {
    const index = buildPrimaryTypeIndex([
      {
        name: 'flying',
        pokemon: [{ slot: 2, pokemon: { name: 'charizard', url: url(6) } }],
      },
      {
        name: 'fire',
        pokemon: [{ slot: 1, pokemon: { name: 'charizard', url: url(6) } }],
      },
    ]);
    expect(index.get(6)).toBe('fire');
  });
});
