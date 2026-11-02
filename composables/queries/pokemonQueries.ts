import {
  type InfiniteData,
  type UseInfiniteQueryReturnType,
  type UseQueryReturnType,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import type {
  EvolutionChainResponse,
  PageParam,
  PokemonDetail,
  PokemonListResponse,
  PokemonSpecies,
  TypeResponse,
} from '~/types/pokemon';
import { getNextOffset, PAGE_SIZE } from '~/utils/dex';
import { DEX_MAX, getErrorStatus, parseIdFromUrl } from '~/utils/pokemon';

interface DetailQueryOptions {
  queryKey: ReturnType<typeof pokemonKeys.detail>;
  queryFn: () => Promise<PokemonDetail>;
}

interface DexNamesQueryOptions {
  queryKey: ReturnType<typeof pokemonKeys.names>;
  queryFn: () => Promise<PokemonListResponse>;
  staleTime: number;
}

interface PokemonDetailQueries {
  pokemon: UseQueryReturnType<PokemonDetail, Error>;
  species: UseQueryReturnType<PokemonSpecies, Error>;
  chain: UseQueryReturnType<EvolutionChainResponse, Error>;
}

const API = 'https://pokeapi.co/api/v2';

export const pokemonKeys = {
  all: ['pokemon'] as const,
  lists: () => [...pokemonKeys.all, 'list'] as const,
  list: (limit: number) => [...pokemonKeys.lists(), { limit }] as const,
  names: () => [...pokemonKeys.all, 'names'] as const,
  type: (name: string) => [...pokemonKeys.all, 'type', name] as const,
  details: () => [...pokemonKeys.all, 'detail'] as const,
  detail: (name: string) => [...pokemonKeys.details(), name] as const,
  species: (idOrName: string | number) =>
    [...pokemonKeys.all, 'species', idOrName] as const,
  chain: (id: number) => [...pokemonKeys.all, 'chain', id] as const,
};

const assertShape = (isValid: boolean, what: string): void => {
  if (!isValid) throw new Error(`Unexpected PokeAPI response for ${what}`);
};

export const fetchPokemonPage = async (
  param: PageParam
): Promise<PokemonListResponse> => {
  const data = await $fetch<PokemonListResponse>(`${API}/pokemon`, {
    query: { offset: param.offset, limit: param.limit },
  });
  assertShape(Array.isArray(data?.results), 'pokemon list');
  return data;
};

export const fetchDexNames = (): Promise<PokemonListResponse> =>
  fetchPokemonPage({ offset: 0, limit: DEX_MAX });

export const fetchType = async (name: string): Promise<TypeResponse> => {
  const data = await $fetch<TypeResponse>(`${API}/type/${name}`);
  assertShape(Array.isArray(data?.pokemon), `type ${name}`);
  return data;
};

export const fetchPokemon = async (name: string): Promise<PokemonDetail> => {
  const data = await $fetch<PokemonDetail>(`${API}/pokemon/${name}`);
  assertShape(
    typeof data?.id === 'number' &&
      Array.isArray(data.types) &&
      Array.isArray(data.stats),
    `pokemon ${name}`
  );
  return data;
};

export const fetchSpecies = async (
  idOrName: string | number
): Promise<PokemonSpecies> => {
  const data = await $fetch<PokemonSpecies>(
    `${API}/pokemon-species/${idOrName}`
  );
  assertShape(
    Array.isArray(data?.flavor_text_entries) && !!data.evolution_chain?.url,
    `species ${idOrName}`
  );
  return data;
};

export const fetchChain = async (
  id: number
): Promise<EvolutionChainResponse> => {
  const data = await $fetch<EvolutionChainResponse>(
    `${API}/evolution-chain/${id}`
  );
  assertShape(Array.isArray(data?.chain?.evolves_to), `evolution chain ${id}`);
  return data;
};

export const pokemonDetailQueryOptions = (
  name: string
): DetailQueryOptions => ({
  queryKey: pokemonKeys.detail(name),
  queryFn: (): Promise<PokemonDetail> => fetchPokemon(name),
});

// The full name list is static for a session, so it never goes stale
export const dexNamesQueryOptions = (): DexNamesQueryOptions => ({
  queryKey: pokemonKeys.names(),
  queryFn: fetchDexNames,
  staleTime: Infinity,
});

export const usePokemonInfiniteList = (
  limit: number = PAGE_SIZE
): UseInfiniteQueryReturnType<
  InfiniteData<PokemonListResponse, PageParam>,
  Error
> =>
  useInfiniteQuery({
    queryKey: pokemonKeys.list(limit),
    queryFn: ({ pageParam }) => fetchPokemonPage(pageParam),
    initialPageParam: { offset: 0, limit } as PageParam,
    getNextPageParam: (_page, _pages, lastParam) =>
      getNextOffset(lastParam, limit),
  });

// Enabled lazily: only when search or a type filter needs all 1025 names
export const useDexNames = (
  isEnabled: MaybeRefOrGetter<boolean>
): UseQueryReturnType<PokemonListResponse, Error> =>
  useQuery({ ...dexNamesQueryOptions(), enabled: isEnabled });

export const usePokemonDetail = (
  name: MaybeRefOrGetter<string>
): PokemonDetailQueries => {
  const pokemon = useQuery({
    queryKey: computed(() => pokemonKeys.detail(toValue(name))),
    queryFn: () => fetchPokemon(toValue(name)),
    // An unknown name is final: do not retry a 404
    retry: (failureCount: number, error: Error) =>
      getErrorStatus(error) !== 404 && failureCount < 2,
  });
  const speciesId = computed(() => pokemon.data.value?.id);
  const species = useQuery({
    queryKey: computed(() => pokemonKeys.species(speciesId.value ?? 0)),
    queryFn: () => fetchSpecies(speciesId.value as number),
    enabled: computed(() => speciesId.value !== undefined),
  });
  const chainId = computed(() => {
    const url = species.data.value?.evolution_chain.url;
    return url ? parseIdFromUrl(url) : undefined;
  });
  const chain = useQuery({
    queryKey: computed(() => pokemonKeys.chain(chainId.value ?? 0)),
    queryFn: () => fetchChain(chainId.value as number),
    enabled: computed(() => chainId.value !== undefined),
  });
  return { pokemon, species, chain };
};
