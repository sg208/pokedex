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
import { DEX_MAX } from '~/utils/pokemon';
import { isPokemonSlug } from '~/utils/pokemonSlug';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

const REQUEST_TIMEOUT_MS = 10_000;

const requestJson = <TData>(
  url: string,
  options: { query?: Record<string, number> } = {}
): Promise<TData> =>
  $fetch<TData>(url, { ...options, timeout: REQUEST_TIMEOUT_MS });

// A name that is not a slug can never exist; fail like a PokeAPI 404 so the
// page shows its not-found state without sending the request
const assertSlug = (value: string, what: string): void => {
  if (!isPokemonSlug(value)) {
    throw Object.assign(new Error(`Unknown ${what}: ${value}`), {
      statusCode: 404,
    });
  }
};

const assertShape = (isValid: boolean, what: string): void => {
  if (!isValid) throw new Error(`Unexpected PokeAPI response for ${what}`);
};

export const fetchPokemonPage = async (
  param: PageParam
): Promise<PokemonListResponse> => {
  const data = await requestJson<PokemonListResponse>(
    `${API_BASE_URL}/pokemon`,
    {
      query: { offset: param.offset, limit: param.limit },
    }
  );
  assertShape(Array.isArray(data?.results), 'pokemon list');
  return data;
};

export const fetchDexNames = (): Promise<PokemonListResponse> =>
  fetchPokemonPage({ offset: 0, limit: DEX_MAX });

export const fetchType = async (name: string): Promise<TypeResponse> => {
  assertSlug(name, 'type');
  const data = await requestJson<TypeResponse>(
    `${API_BASE_URL}/type/${encodeURIComponent(name)}`
  );
  assertShape(Array.isArray(data?.pokemon), `type ${name}`);
  return data;
};

export const fetchPokemon = async (name: string): Promise<PokemonDetail> => {
  assertSlug(name, 'pokemon');
  const data = await requestJson<PokemonDetail>(
    `${API_BASE_URL}/pokemon/${encodeURIComponent(name)}`
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
  const data = await requestJson<PokemonSpecies>(
    `${API_BASE_URL}/pokemon-species/${encodeURIComponent(idOrName)}`
  );
  assertShape(
    Array.isArray(data?.flavor_text_entries) && !!data.evolution_chain?.url,
    `species ${idOrName}`
  );
  return data;
};

export const fetchAbility = async (name: string): Promise<AbilityResponse> => {
  assertSlug(name, 'ability');
  const data = await requestJson<AbilityResponse>(
    `${API_BASE_URL}/ability/${encodeURIComponent(name)}`
  );
  assertShape(Array.isArray(data?.effect_entries), `ability ${name}`);
  return data;
};

export const fetchChain = async (
  id: number
): Promise<EvolutionChainResponse> => {
  const data = await requestJson<EvolutionChainResponse>(
    `${API_BASE_URL}/evolution-chain/${id}`
  );
  assertShape(Array.isArray(data?.chain?.evolves_to), `evolution chain ${id}`);
  return data;
};

// Same-origin static snapshot from scripts/build-dex-index.ts
export const DEX_INDEX_URL = '/data/dex-index.json';

export const fetchDexIndex = async (): Promise<DexIndex> => {
  const data = await requestJson<DexIndex>(DEX_INDEX_URL);
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
