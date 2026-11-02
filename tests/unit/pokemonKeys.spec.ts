import { describe, it, expect } from 'vitest';
import { pokemonKeys } from '~/composables/queries/pokemonQueries';

describe('pokemonKeys', () => {
  it('builds hierarchical keys', () => {
    expect(pokemonKeys.all).toEqual(['pokemon']);
    expect(pokemonKeys.lists()).toEqual(['pokemon', 'list']);
    expect(pokemonKeys.list(24)).toEqual(['pokemon', 'list', { limit: 24 }]);
    expect(pokemonKeys.names()).toEqual(['pokemon', 'names']);
    expect(pokemonKeys.type('fire')).toEqual(['pokemon', 'type', 'fire']);
    expect(pokemonKeys.details()).toEqual(['pokemon', 'detail']);
    expect(pokemonKeys.detail('pikachu')).toEqual([
      'pokemon',
      'detail',
      'pikachu',
    ]);
    expect(pokemonKeys.species(25)).toEqual(['pokemon', 'species', 25]);
    expect(pokemonKeys.chain(10)).toEqual(['pokemon', 'chain', 10]);
  });

  it('nests detail keys under the details prefix', () => {
    expect(pokemonKeys.detail('mew').slice(0, 2)).toEqual(
      pokemonKeys.details()
    );
  });
});
