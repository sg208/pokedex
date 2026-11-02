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
  typeMembers: Map<number, string[]>;
  // id to English display name; searched alongside the slug once the snapshot loads
  displayNames?: Map<number, string>;
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

// Lowercase, no diacritics, ♀/♂ as f/m, letters and digits only
export const foldSearchText = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replaceAll('♀', 'f')
    .replaceAll('♂', 'm')
    .replace(/[^a-z0-9]/g, '');

export const displayNameFor = (
  index: { pokemon: { id: number; displayName: string }[] } | undefined,
  id: number
): string | undefined => {
  const entry = index?.pokemon[id - 1];
  return entry?.id === id ? entry.displayName : undefined;
};

export const filterDex = (
  entries: DexEntry[],
  { query, type, typeMembers, displayNames }: DexFilters
): DexEntry[] => {
  const trimmed = query.trim();
  const numeric = trimmed.replace(/^#/, '');
  const needle = foldSearchText(trimmed);
  return entries.filter((entry) => {
    if (type && !typeMembers.get(entry.id)?.includes(type)) return false;
    if (!trimmed) return true;
    const isNumberMatch =
      /^\d+$/.test(numeric) && String(entry.id) === numeric.replace(/^0+/, '');
    if (isNumberMatch) return true;
    if (!needle) return false;
    return (
      foldSearchText(entry.name).includes(needle) ||
      foldSearchText(displayNames?.get(entry.id) ?? '').includes(needle)
    );
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

// Every type of each Pokémon (slot 1 and 2), for the type filter; forms above DEX_MAX are ignored
export const buildTypeMembers = (
  typeResponses: TypeResponse[]
): Map<number, string[]> => {
  const members = new Map<number, string[]>();
  typeResponses.forEach((response) => {
    response.pokemon.forEach((member) => {
      const id = parseIdFromUrl(member.pokemon.url);
      if (id > DEX_MAX) return;
      members.set(id, [...(members.get(id) ?? []), response.name]);
    });
  });
  return members;
};
