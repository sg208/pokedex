import { describe, it, expect } from 'vitest';
import { queryClientOptions } from '~/plugins/vue-query';

// Protects: the dex data is effectively static, so it is cached for a day and
// never refetched on focus (PokeAPI fair use). Turns red if the defaults drift.
describe('query client defaults', () => {
  it('caches for 24 hours and does not refetch on focus', () => {
    const queries = queryClientOptions.defaultOptions?.queries;
    expect(queries?.staleTime).toBe(24 * 60 * 60 * 1000);
    expect(queries?.retry).toBe(2);
    expect(queries?.refetchOnWindowFocus).toBe(false);
  });

  it('keeps data for 24 hours in the browser', () => {
    expect(queryClientOptions.defaultOptions?.queries?.gcTime).toBe(
      24 * 60 * 60 * 1000
    );
  });
});
