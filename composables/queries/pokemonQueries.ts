import {
  type InfiniteData,
  type QueryClient,
  type UseInfiniteQueryReturnType,
  type UseQueryReturnType,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/vue-query';
import type { MaybeRefOrGetter } from 'vue';
import type {
  AbilityResponse,
  DexIndex,
  EvolutionChainResponse,
  PageParam,
  PokemonDetail,
  PokemonListResponse,
  PokemonSpecies,
  TypeResponse,
} from '~/types/pokemon';
import { getNextOffset, PAGE_SIZE } from '~/utils/dex';
import { DEX_MAX, getErrorStatus, parseIdFromUrl } from '~/utils/pokemon';
import { isPokemonSlug } from '~/utils/pokemonSlug';

interface DetailQueryOptions {
  queryKey: ReturnType<typeof pokemonKeys.detail>;
  queryFn: () => Promise<PokemonDetail>;
}

interface DexIndexQueryOptions {
  queryKey: ReturnType<typeof pokemonKeys.dexIndex>;
  queryFn: () => Promise<DexIndex>;
  staleTime: number;
}

interface SpeciesQueryOptions {
  queryKey: ReturnType<typeof pokemonKeys.species>;
  queryFn: () => Promise<PokemonSpecies>;
}

interface ChainQueryOptions {
  queryKey: ReturnType<typeof pokemonKeys.chain>;
  queryFn: () => Promise<EvolutionChainResponse>;
}

interface AbilityQueryOptions {
  queryKey: ReturnType<typeof pokemonKeys.ability>;
  queryFn: () => Promise<AbilityResponse>;
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

export const REQUEST_TIMEOUT_MS = 10_000;

// A name that is not a slug can never exist; fail like a PokeAPI 404 so the
// page shows its not-found state without sending the request
const assertSlug = (value: string, what: string): void => {
  if (!isPokemonSlug(value)) {
    throw Object.assign(new Error(`Unknown ${what}: ${value}`), {
      statusCode: 404,
    });
  }
};

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
  ability: (name: string) => [...pokemonKeys.all, 'ability', name] as const,
  chain: (id: number) => [...pokemonKeys.all, 'chain', id] as const,
  dexIndex: () => [...pokemonKeys.all, 'dex-index'] as const,
};

const assertShape = (isValid: boolean, what: string): void => {
  if (!isValid) throw new Error(`Unexpected PokeAPI response for ${what}`);
};

export const fetchPokemonPage = async (
  param: PageParam
): Promise<PokemonListResponse> => {
  const data = await $fetch<PokemonListResponse>(`${API}/pokemon`, {
    query: { offset: param.offset, limit: param.limit },
    timeout: REQUEST_TIMEOUT_MS,
  });
  assertShape(Array.isArray(data?.results), 'pokemon list');
  return data;
};

export const fetchDexNames = (): Promise<PokemonListResponse> =>
  fetchPokemonPage({ offset: 0, limit: DEX_MAX });

export const fetchType = async (name: string): Promise<TypeResponse> => {
  assertSlug(name, 'type');
  const data = await $fetch<TypeResponse>(
    `${API}/type/${encodeURIComponent(name)}`,
    { timeout: REQUEST_TIMEOUT_MS }
  );
  assertShape(Array.isArray(data?.pokemon), `type ${name}`);
  return data;
};

export const fetchPokemon = async (name: string): Promise<PokemonDetail> => {
  assertSlug(name, 'pokemon');
  const data = await $fetch<PokemonDetail>(
    `${API}/pokemon/${encodeURIComponent(name)}`,
    { timeout: REQUEST_TIMEOUT_MS }
  );
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
  if (typeof idOrName === 'string') assertSlug(idOrName, 'species');
  const data = await $fetch<PokemonSpecies>(
    `${API}/pokemon-species/${encodeURIComponent(idOrName)}`,
    { timeout: REQUEST_TIMEOUT_MS }
  );
  assertShape(
    Array.isArray(data?.flavor_text_entries) && !!data.evolution_chain?.url,
    `species ${idOrName}`
  );
  return data;
};

export const fetchAbility = async (name: string): Promise<AbilityResponse> => {
  assertSlug(name, 'ability');
  const data = await $fetch<AbilityResponse>(
    `${API}/ability/${encodeURIComponent(name)}`,
    { timeout: REQUEST_TIMEOUT_MS }
  );
  assertShape(Array.isArray(data?.effect_entries), `ability ${name}`);
  return data;
};

export const fetchChain = async (
  id: number
): Promise<EvolutionChainResponse> => {
  const data = await $fetch<EvolutionChainResponse>(
    `${API}/evolution-chain/${id}`,
    { timeout: REQUEST_TIMEOUT_MS }
  );
  assertShape(Array.isArray(data?.chain?.evolves_to), `evolution chain ${id}`);
  return data;
};

// Same-origin static snapshot from scripts/build-dex-index.ts
export const DEX_INDEX_URL = '/data/dex-index.json';

export const fetchDexIndex = async (): Promise<DexIndex> => {
  const data = await $fetch<DexIndex>(DEX_INDEX_URL, {
    timeout: REQUEST_TIMEOUT_MS,
  });
  assertShape(
    Array.isArray(data?.pokemon) &&
      data.pokemon.length === DEX_MAX &&
      Array.isArray(data.forms) &&
      Array.isArray(data.chart) &&
      data.chart.length === data.types?.length &&
      typeof data.moves === 'object',
    'dex index'
  );
  return data;
};

// The snapshot only changes on deploy, so it never goes stale in a session
export const dexIndexQueryOptions = (): DexIndexQueryOptions => ({
  queryKey: pokemonKeys.dexIndex(),
  queryFn: fetchDexIndex,
  staleTime: Infinity,
});

export const useDexIndex = (): UseQueryReturnType<DexIndex, Error> =>
  useQuery(dexIndexQueryOptions());

export const pokemonDetailQueryOptions = (
  name: string
): DetailQueryOptions => ({
  queryKey: pokemonKeys.detail(name),
  queryFn: (): Promise<PokemonDetail> => fetchPokemon(name),
});

export const speciesQueryOptions = (id: number): SpeciesQueryOptions => ({
  queryKey: pokemonKeys.species(id),
  queryFn: (): Promise<PokemonSpecies> => fetchSpecies(id),
});

export const abilityQueryOptions = (name: string): AbilityQueryOptions => ({
  queryKey: pokemonKeys.ability(name),
  queryFn: (): Promise<AbilityResponse> => fetchAbility(name),
});

export const chainQueryOptions = (id: number): ChainQueryOptions => ({
  queryKey: pokemonKeys.chain(id),
  queryFn: (): Promise<EvolutionChainResponse> => fetchChain(id),
});

// Warms everything the detail page loads: Pokémon -> species -> chain, plus
// the snapshot. Cached entries are reused, so repeat calls cost nothing.
export const prefetchPokemonDetail = async (
  queryClient: QueryClient,
  name: string
): Promise<void> => {
  void queryClient.prefetchQuery(dexIndexQueryOptions());
  try {
    const pokemon = await queryClient.fetchQuery(
      pokemonDetailQueryOptions(name)
    );
    const species = await queryClient.fetchQuery(
      speciesQueryOptions(pokemon.id)
    );
    await queryClient.prefetchQuery(
      chainQueryOptions(parseIdFromUrl(species.evolution_chain.url))
    );
  } catch {
    // Best effort: the page fetches (and reports errors) on its own
  }
};

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
    queryKey: computed(
      () => speciesQueryOptions(speciesId.value ?? 0).queryKey
    ),
    queryFn: () => speciesQueryOptions(speciesId.value as number).queryFn(),
    enabled: computed(() => speciesId.value !== undefined),
  });
  const chainId = computed(() => {
    const url = species.data.value?.evolution_chain.url;
    return url ? parseIdFromUrl(url) : undefined;
  });
  const chain = useQuery({
    queryKey: computed(() => chainQueryOptions(chainId.value ?? 0).queryKey),
    queryFn: () => chainQueryOptions(chainId.value as number).queryFn(),
    enabled: computed(() => chainId.value !== undefined),
  });
  return { pokemon, species, chain };
};
