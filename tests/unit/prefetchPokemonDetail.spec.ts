import { QueryClient } from '@tanstack/vue-query';
import { describe, expect, it, vi } from 'vitest';
import {
  pokemonKeys,
  prefetchPokemonDetail,
} from '~/composables/queries/pokemonQueries';
import { queryClientOptions } from '~/plugins/vue-query';

const API = 'https://pokeapi.co/api/v2';

const seededClient = (): QueryClient => {
  const client = new QueryClient(queryClientOptions);
  client.setQueryData(pokemonKeys.detail('pikachu'), { id: 25 });
  client.setQueryData(pokemonKeys.species(25), {
    evolution_chain: { url: `${API}/evolution-chain/10/` },
  });
  return client;
};

describe('prefetchPokemonDetail', () => {
  it('walks Pokémon, species and chain, and warms the snapshot', async () => {
    const client = seededClient();
    const prefetch = vi
      .spyOn(client, 'prefetchQuery')
      .mockResolvedValue(undefined);
    await prefetchPokemonDetail(client, 'pikachu');
    const keys = prefetch.mock.calls.map(
      (call) => (call[0] as { queryKey: unknown }).queryKey
    );
    expect(keys).toEqual([pokemonKeys.dexIndex(), pokemonKeys.chain(10)]);
  });

  it('reuses fresh cache entries under the 24h stale time of the app', async () => {
    const client = seededClient();
    vi.spyOn(client, 'prefetchQuery').mockResolvedValue(undefined);
    const fetchQuery = vi.spyOn(client, 'fetchQuery');
    await prefetchPokemonDetail(client, 'pikachu');
    const results = await Promise.all(
      fetchQuery.mock.results.map((result) => result.value)
    );
    expect(results).toEqual([
      { id: 25 },
      { evolution_chain: { url: `${API}/evolution-chain/10/` } },
    ]);
  });

  it('swallows failures: the page reports its own errors', async () => {
    const client = new QueryClient(queryClientOptions);
    vi.spyOn(client, 'prefetchQuery').mockResolvedValue(undefined);
    vi.spyOn(client, 'fetchQuery').mockRejectedValue(new Error('offline'));
    await expect(
      prefetchPokemonDetail(client, 'pikachu')
    ).resolves.toBeUndefined();
  });
});
