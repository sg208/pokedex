import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  dexNamesQueryOptions,
  fetchChain,
  fetchDexNames,
  fetchPokemon,
  fetchPokemonPage,
  fetchSpecies,
  fetchType,
} from '~/composables/queries/pokemonQueries';

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));

// $fetch is captured at import time by Nuxt, so mock the auto-import, not the global
mockNuxtImport('$fetch', () => fetchMock);

const BASE = 'https://pokeapi.co/api/v2';

afterEach(() => fetchMock.mockReset());

describe('pokemon fetchers', () => {
  it('requests a list page with offset and limit', async () => {
    fetchMock.mockResolvedValue({
      count: 1025,
      next: null,
      previous: null,
      results: [],
    });
    await fetchPokemonPage({ offset: 24, limit: 24 });
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/pokemon`, {
      query: { offset: 24, limit: 24 },
    });
  });

  it('requests all names in one call', async () => {
    fetchMock.mockResolvedValue({
      count: 1025,
      next: null,
      previous: null,
      results: [],
    });
    await fetchDexNames();
    expect(fetchMock).toHaveBeenCalledWith(`${BASE}/pokemon`, {
      query: { offset: 0, limit: 1025 },
    });
  });

  it('requests type, pokemon, species and chain by path', async () => {
    fetchMock.mockResolvedValueOnce({ name: 'fire', pokemon: [] });
    await fetchType('fire');
    expect(fetchMock).toHaveBeenLastCalledWith(`${BASE}/type/fire`);

    fetchMock.mockResolvedValueOnce({
      id: 25,
      name: 'pikachu',
      types: [],
      stats: [],
      abilities: [],
    });
    await fetchPokemon('pikachu');
    expect(fetchMock).toHaveBeenLastCalledWith(`${BASE}/pokemon/pikachu`);

    fetchMock.mockResolvedValueOnce({
      id: 25,
      flavor_text_entries: [],
      genera: [],
      evolution_chain: { url: `${BASE}/evolution-chain/10/` },
    });
    await fetchSpecies(25);
    expect(fetchMock).toHaveBeenLastCalledWith(`${BASE}/pokemon-species/25`);

    fetchMock.mockResolvedValueOnce({
      id: 10,
      chain: { species: { name: 'pichu', url: '' }, evolves_to: [] },
    });
    await fetchChain(10);
    expect(fetchMock).toHaveBeenLastCalledWith(`${BASE}/evolution-chain/10`);
  });

  it('throws on malformed responses', async () => {
    fetchMock.mockResolvedValue({ unexpected: true });
    await expect(fetchPokemonPage({ offset: 0, limit: 24 })).rejects.toThrow();
    await expect(fetchType('fire')).rejects.toThrow();
    await expect(fetchPokemon('pikachu')).rejects.toThrow();
    await expect(fetchSpecies(25)).rejects.toThrow();
    await expect(fetchChain(10)).rejects.toThrow();
  });

  it('never expires the names query', () => {
    expect(dexNamesQueryOptions().staleTime).toBe(Infinity);
    expect(dexNamesQueryOptions().queryKey).toEqual(['pokemon', 'names']);
  });
});
