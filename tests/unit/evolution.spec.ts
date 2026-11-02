import { describe, it, expect } from 'vitest';
import type { ChainLink } from '~/types/pokemon';
import { flattenChain } from '~/utils/evolution';

const link = (
  id: number,
  name: string,
  evolves_to: ChainLink[] = []
): ChainLink => ({
  species: { name, url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` },
  evolves_to,
});

describe('flattenChain', () => {
  it('flattens a linear chain in order', () => {
    const chain = link(1, 'bulbasaur', [
      link(2, 'ivysaur', [link(3, 'venusaur')]),
    ]);
    expect(flattenChain(chain).map((stage) => stage.name)).toEqual([
      'bulbasaur',
      'ivysaur',
      'venusaur',
    ]);
  });

  it('keeps every branch of an eevee-style chain', () => {
    const chain = link(133, 'eevee', [
      link(134, 'vaporeon'),
      link(135, 'jolteon'),
      link(136, 'flareon'),
    ]);
    expect(flattenChain(chain).map((stage) => stage.id)).toEqual([
      133, 134, 135, 136,
    ]);
  });

  it('returns one stage for a single-stage chain', () => {
    expect(flattenChain(link(132, 'ditto'))).toEqual([
      { id: 132, name: 'ditto' },
    ]);
  });

  it('drops stages above the dex ceiling', () => {
    expect(flattenChain(link(10001, 'form'))).toEqual([]);
  });
});
