import { RARITIES, isSortKey } from '~/utils/dexSort';
import type { Rarity, SortDir, SortKey } from '~/utils/dexSort';
import { TYPE_NAMES } from '~/utils/typeStyles';

type QueryValue = string | null | undefined;
export type DexQueryInput = Record<string, QueryValue | QueryValue[]>;

export interface DexQueryState {
  query: string;
  type: string | null;
  gen: number | null;
  rarity: Rarity | null;
  sort: SortKey | null;
  dir: SortDir;
}

// Keys this module owns; any other key in the URL is left alone
const OWN_KEYS = ['q', 'type', 'gen', 'rarity', 'sort', 'dir'];

const first = (value: QueryValue | QueryValue[]): string | null => {
  const picked = Array.isArray(value) ? value[0] : value;
  return typeof picked === 'string' ? picked : null;
};

// Reads the filter state from a route query; an unknown type is ignored
export const parseDexQuery = (input: DexQueryInput): DexQueryState => {
  const type = first(input.type);
  const gen = first(input.gen);
  const rarity = first(input.rarity);
  const sort = first(input.sort);
  return {
    query: first(input.q) ?? '',
    type: type && TYPE_NAMES.some((name) => name === type) ? type : null,
    gen: gen && /^[1-9]$/.test(gen) ? Number(gen) : null,
    rarity: RARITIES.find((item) => item === rarity) ?? null,
    sort: isSortKey(sort) ? sort : null,
    dir: first(input.dir) === 'asc' ? 'asc' : 'desc',
  };
};

// Writes the filter state onto a route query, keeping unknown keys and omitting defaults
export const buildDexQuery = (
  current: DexQueryInput,
  state: DexQueryState
): DexQueryInput => {
  const rest = Object.fromEntries(
    Object.entries(current).filter(([key]) => !OWN_KEYS.includes(key))
  );
  const query = state.query.trim();
  return {
    ...rest,
    ...(query ? { q: query } : {}),
    ...(state.type ? { type: state.type } : {}),
    ...(state.gen ? { gen: String(state.gen) } : {}),
    ...(state.rarity ? { rarity: state.rarity } : {}),
    ...(state.sort ? { sort: state.sort } : {}),
    ...(state.sort && state.dir === 'asc' ? { dir: 'asc' } : {}),
  };
};

// Same filters, ignoring surrounding spaces in the search text
export const isSameDexState = (a: DexQueryState, b: DexQueryState): boolean =>
  a.query.trim() === b.query.trim() &&
  a.type === b.type &&
  a.gen === b.gen &&
  a.rarity === b.rarity &&
  a.sort === b.sort &&
  a.dir === b.dir;
