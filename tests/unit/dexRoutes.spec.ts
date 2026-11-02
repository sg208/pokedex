import { describe, it, expect } from 'vitest';
import { buildDetailRoutes, extractDexEntries } from '~/utils/pokemon';

const makeResponse = (
  count: number,
  lastId = count
): { results: { name: string; url: string }[] } => ({
  results: Array.from({ length: count }, (_, index) => ({
    name: `mon-${index + 1}`,
    url: `https://pokeapi.co/api/v2/pokemon/${index === count - 1 ? lastId : index + 1}/`,
  })),
});

describe('buildDetailRoutes', () => {
  it('maps names to /pokemon/<name> routes', () => {
    expect(buildDetailRoutes(['bulbasaur', 'mr-mime'])).toEqual([
      '/pokemon/bulbasaur',
      '/pokemon/mr-mime',
    ]);
  });

  it('throws on an empty list', () => {
    expect(() => buildDetailRoutes([])).toThrow();
  });

  it('throws on malformed names', () => {
    expect(() => buildDetailRoutes(['ok', '../etc'])).toThrow();
    expect(() => buildDetailRoutes([42 as unknown as string])).toThrow();
    expect(() => buildDetailRoutes('nope' as unknown as string[])).toThrow();
  });
});

describe('extractDexEntries', () => {
  it('returns all 1025 names when the last id is 1025', () => {
    const entries = extractDexEntries(makeResponse(1025));
    expect(entries).toHaveLength(1025);
    expect(entries[0]).toEqual({ name: 'mon-1', id: 1 });
    expect(entries[1024]).toEqual({ name: 'mon-1025', id: 1025 });
  });

  it('throws when the count is not 1025', () => {
    expect(() => extractDexEntries(makeResponse(1000))).toThrow();
  });

  it('throws when the last id is not 1025', () => {
    expect(() => extractDexEntries(makeResponse(1025, 10001))).toThrow();
  });

  it('throws on a malformed response', () => {
    expect(() => extractDexEntries({})).toThrow();
    expect(() => extractDexEntries(null)).toThrow();
  });
});
