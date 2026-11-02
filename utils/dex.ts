import type {
  DexEntry,
  NamedResource,
  PageParam,
  TypeResponse,
} from '~/types/pokemon';
import { DEX_MAX, parseIdFromUrl } from '~/utils/pokemon';

export const PAGE_SIZE = 24;

export interface DexFilters {
  query: string;
  type: string | null;
  typeIndex: Map<number, string>;
}

// Next infinite-query page param; the last page is shortened to end at DEX_MAX
export const getNextOffset = (
  current: PageParam,
  pageSize: number = PAGE_SIZE
): PageParam | undefined => {
  const offset = current.offset + current.limit;
  if (offset >= DEX_MAX) return undefined;
  return { offset, limit: Math.min(pageSize, DEX_MAX - offset) };
};

export const parseDexEntries = (results: NamedResource[]): DexEntry[] =>
  results
    .map((entry) => ({ id: parseIdFromUrl(entry.url), name: entry.name }))
    .filter((entry) => entry.id <= DEX_MAX);

const normalise = (text: string): string =>
  text.toLowerCase().replaceAll('-', ' ').trim();

export const filterDex = (
  entries: DexEntry[],
  { query, type, typeIndex }: DexFilters
): DexEntry[] => {
  const needle = normalise(query);
  const numeric = needle.replace(/^#/, '');
  return entries.filter((entry) => {
    if (type && typeIndex.get(entry.id) !== type) return false;
    if (!needle) return true;
    const isNumberMatch =
      /^\d+$/.test(numeric) && String(entry.id) === numeric.replace(/^0+/, '');
    return isNumberMatch || normalise(entry.name).includes(needle);
  });
};

// Primary type = slot 1 of each type list; forms above DEX_MAX are ignored
export const buildPrimaryTypeIndex = (
  typeResponses: TypeResponse[]
): Map<number, string> => {
  const index = new Map<number, string>();
  typeResponses.forEach((response) => {
    response.pokemon.forEach((member) => {
      if (member.slot !== 1) return;
      const id = parseIdFromUrl(member.pokemon.url);
      if (id <= DEX_MAX) index.set(id, response.name);
    });
  });
  return index;
};
