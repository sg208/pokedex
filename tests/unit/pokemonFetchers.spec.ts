import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchAbility,
  fetchChain,
  fetchDexIndex,
  fetchDexNames,
  fetchPokemon,
  fetchPokemonPage,
  fetchSpecies,
  fetchType,
} from '~/composables/queries/pokemonFetchers';
import {
  abilityQueryOptions,
  dexNamesQueryOptions,
  pokemonKeys,
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
      timeout: 10_000,
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
      timeout: 10_000,
    });
  });

  it('requests type, pokemon, species and chain by path', async () => {
    fetchMock.mockResolvedValueOnce({ name: 'fire', pokemon: [] });
    await fetchType('fire');
    expect(fetchMock).toHaveBeenLastCalledWith(`${BASE}/type/fire`, {
      timeout: 10_000,
    });

    fetchMock.mockResolvedValueOnce({
      id: 25,
      name: 'pikachu',
      types: [],
      stats: [],
      abilities: [],
    });
    await fetchPokemon('pikachu');
    expect(fetchMock).toHaveBeenLastCalledWith(`${BASE}/pokemon/pikachu`, {
      timeout: 10_000,
    });

    fetchMock.mockResolvedValueOnce({
      id: 25,
      flavor_text_entries: [],
      genera: [],
      evolution_chain: { url: `${BASE}/evolution-chain/10/` },
    });
    await fetchSpecies(25);
    expect(fetchMock).toHaveBeenLastCalledWith(`${BASE}/pokemon-species/25`, {
      timeout: 10_000,
    });

    fetchMock.mockResolvedValueOnce({
      id: 10,
      chain: { species: { name: 'pichu', url: '' }, evolves_to: [] },
    });
    await fetchChain(10);
    expect(fetchMock).toHaveBeenLastCalledWith(`${BASE}/evolution-chain/10`, {
      timeout: 10_000,
    });
  });

  it('throws on malformed responses', async () => {
    fetchMock.mockResolvedValue({ unexpected: true });
    await expect(fetchPokemonPage({ offset: 0, limit: 24 })).rejects.toThrow();
    await expect(fetchType('fire')).rejects.toThrow();
    await expect(fetchPokemon('pikachu')).rejects.toThrow();
    await expect(fetchSpecies(25)).rejects.toThrow();
    await expect(fetchChain(10)).rejects.toThrow();
  });

  it('rejects traversal slugs with a 404 before any request', async () => {
    for (const bad of ['../berry/1', 'a/b', 'A', '', '%2e']) {
      await expect(fetchPokemon(bad)).rejects.toMatchObject({
        statusCode: 404,
      });
      await expect(fetchType(bad)).rejects.toMatchObject({ statusCode: 404 });
      await expect(fetchSpecies(bad)).rejects.toMatchObject({
        statusCode: 404,
      });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('passes valid slugs through encodeURIComponent unchanged', async () => {
    fetchMock.mockResolvedValueOnce({
      id: 122,
      name: 'mr-mime',
      types: [],
      stats: [],
      abilities: [],
    });
    await fetchPokemon('mr-mime');
    expect(fetchMock).toHaveBeenLastCalledWith(`${BASE}/pokemon/mr-mime`, {
      timeout: 10_000,
    });
  });

  it('times out the same-origin snapshot request too', async () => {
    fetchMock.mockResolvedValue({ unexpected: true });
    await expect(fetchDexIndex()).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledWith('/data/dex-index.json', {
      timeout: 10_000,
    });
  });

  it('requests an ability by encoded name with the timeout', async () => {
    fetchMock.mockResolvedValueOnce({ name: 'rough-skin', effect_entries: [] });
    await fetchAbility('rough-skin');
    expect(fetchMock).toHaveBeenLastCalledWith(`${BASE}/ability/rough-skin`, {
      timeout: 10_000,
    });
  });

  it('rejects an ability name that is not a slug before any request', async () => {
    fetchMock.mockClear();
    await expect(fetchAbility('../move/1')).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an ability response without effect entries', async () => {
    fetchMock.mockResolvedValueOnce({ name: 'x' });
    await expect(fetchAbility('x')).rejects.toThrow(/ability x/);
  });

  it('keys ability queries by name', () => {
    expect(pokemonKeys.ability('static')).toEqual([
      'pokemon',
      'ability',
      'static',
    ]);
    expect(abilityQueryOptions('static').queryKey).toEqual([
      'pokemon',
      'ability',
      'static',
    ]);
  });

  it('never expires the names query', () => {
    expect(dexNamesQueryOptions().staleTime).toBe(Infinity);
    expect(dexNamesQueryOptions().queryKey).toEqual(['pokemon', 'names']);
  });
});
