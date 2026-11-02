import { describe, expect, it } from 'vitest';
import { buildDetailRoutes } from '~/utils/pokemon';
import { isPokemonSlug } from '~/utils/pokemonSlug';

describe('isPokemonSlug', () => {
  it.each(['mr-mime', 'nidoran-f', 'ho-oh', 'pikachu', 'porygon2'])(
    'accepts %s',
    (slug) => {
      expect(isPokemonSlug(slug)).toBe(true);
    }
  );

  it.each(['../berry/1', 'a/b', 'A', '', '%2e', 'mr mime', 'a?b'])(
    'rejects %j',
    (slug) => {
      expect(isPokemonSlug(slug)).toBe(false);
    }
  );

  it('rejects non-strings', () => {
    expect(isPokemonSlug(undefined)).toBe(false);
    expect(isPokemonSlug(25)).toBe(false);
  });

  it('agrees with what buildDetailRoutes accepts', () => {
    const samples = ['mr-mime', 'ho-oh', '../x', 'A', '', 'a/b', 'nidoran-f'];
    for (const sample of samples) {
      let isAccepted = true;
      try {
        buildDetailRoutes([sample]);
      } catch {
        isAccepted = false;
      }
      expect(isPokemonSlug(sample)).toBe(isAccepted);
    }
  });
});
