export const SORT_KEYS = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
  'total',
] as const;

export type SortKey = (typeof SORT_KEYS)[number];
export type SortDir = 'asc' | 'desc';
export type Rarity = 'legendary' | 'mythical';

export const RARITIES: readonly Rarity[] = ['legendary', 'mythical'];
export const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

interface SortableMon {
  id: number;
  stats: number[];
  bst: number;
  generation: number;
  isLegendary: boolean;
  isMythical: boolean;
}

interface SortSource {
  pokemon: SortableMon[];
}

export const isSortKey = (value: unknown): value is SortKey =>
  SORT_KEYS.some((key) => key === value);

const valueOf = (mon: SortableMon | undefined, sort: SortKey): number => {
  if (!mon) return 0;
  return sort === 'total' ? mon.bst : (mon.stats[SORT_KEYS.indexOf(sort)] ?? 0);
};

// Ties fall back to dex number, whichever the direction
export const sortEntries = <T extends { id: number }>(
  entries: T[],
  source: SortSource,
  sort: SortKey,
  dir: SortDir
): T[] => {
  const sign = dir === 'asc' ? 1 : -1;
  const value = (entry: T): number =>
    valueOf(source.pokemon[entry.id - 1], sort);
  return [...entries].sort(
    (a, b) => sign * (value(a) - value(b)) || a.id - b.id
  );
};

export const filterByTraits = <T extends { id: number }>(
  entries: T[],
  source: SortSource,
  { gen, rarity }: { gen: number | null; rarity: Rarity | null }
): T[] =>
  entries.filter((entry) => {
    const mon = source.pokemon[entry.id - 1];
    if (!mon) return false;
    if (gen !== null && mon.generation !== gen) return false;
    if (rarity === 'legendary' && !mon.isLegendary) return false;
    if (rarity === 'mythical' && !mon.isMythical) return false;
    return true;
  });
