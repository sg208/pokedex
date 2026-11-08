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
} from '~/types/pokemon';
import {
  fetchAbility,
  fetchChain,
  fetchDexIndex,
  fetchDexNames,
  fetchPokemon,
  fetchPokemonPage,
  fetchSpecies,
} from '~/composables/queries/pokemonFetchers';
import { getNextOffset, PAGE_SIZE } from '~/utils/dex';
import { getErrorStatus, parseIdFromUrl } from '~/utils/pokemon';

interface KeyedQuery<TKey extends readonly unknown[], TData> {
  queryKey: TKey;
  queryFn: () => Promise<TData>;
}

interface StaticQuery<
  TKey extends readonly unknown[],
  TData,
> extends KeyedQuery<TKey, TData> {
  staleTime: number;
}

interface PokemonDetailQueries {
  pokemon: UseQueryReturnType<PokemonDetail, Error>;
  species: UseQueryReturnType<PokemonSpecies, Error>;
  chain: UseQueryReturnType<EvolutionChainResponse, Error>;
}

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

// The snapshot only changes on deploy, so it never goes stale in a session
export const dexIndexQueryOptions = (): StaticQuery<
  ReturnType<typeof pokemonKeys.dexIndex>,
  DexIndex
> => ({
  queryKey: pokemonKeys.dexIndex(),
  queryFn: fetchDexIndex,
  staleTime: Infinity,
});

export const useDexIndex = (): UseQueryReturnType<DexIndex, Error> =>
  useQuery(dexIndexQueryOptions());

export const pokemonDetailQueryOptions = (
  name: string
): KeyedQuery<ReturnType<typeof pokemonKeys.detail>, PokemonDetail> => ({
  queryKey: pokemonKeys.detail(name),
  queryFn: (): Promise<PokemonDetail> => fetchPokemon(name),
});

export const speciesQueryOptions = (
  id: number
): KeyedQuery<ReturnType<typeof pokemonKeys.species>, PokemonSpecies> => ({
  queryKey: pokemonKeys.species(id),
  queryFn: (): Promise<PokemonSpecies> => fetchSpecies(id),
});

export const abilityQueryOptions = (
  name: string
): KeyedQuery<ReturnType<typeof pokemonKeys.ability>, AbilityResponse> => ({
  queryKey: pokemonKeys.ability(name),
  queryFn: (): Promise<AbilityResponse> => fetchAbility(name),
});

export const chainQueryOptions = (
  id: number
): KeyedQuery<
  ReturnType<typeof pokemonKeys.chain>,
  EvolutionChainResponse
> => ({
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
export const dexNamesQueryOptions = (): StaticQuery<
  ReturnType<typeof pokemonKeys.names>,
  PokemonListResponse
> => ({
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
