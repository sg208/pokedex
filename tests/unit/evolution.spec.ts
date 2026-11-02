import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import type { ChainLink, DexIndex, EvolutionDetail } from '~/types/pokemon';
import {
  buildEvolutionTree,
  defaultPokemonName,
  flattenChain,
} from '~/utils/evolution';

const link = (
  id: number,
  name: string,
  evolves_to: ChainLink[] = []
): ChainLink => ({
  species: { name, url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` },
  evolves_to,
});

const lvl = (min_level: number): EvolutionDetail => ({
  trigger: { name: 'level-up', url: '' },
  min_level,
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

describe('defaultPokemonName', () => {
  const index = JSON.parse(
    readFileSync('public/data/dex-index.json', 'utf8')
  ) as DexIndex;

  it('returns the snapshot name for every one of the 1025 ids', () => {
    index.pokemon.forEach((mon) => {
      expect(defaultPokemonName(mon.id, index.pokemon, 'x')).toBe(mon.name);
    });
    expect(index.pokemon).toHaveLength(1025);
  });

  it.each([
    [849, 'toxtricity-amped'],
    [892, 'urshifu-single-strike'],
    [681, 'aegislash-shield'],
    [745, 'lycanroc-midday'],
    [413, 'wormadam-plant'],
    [550, 'basculin-red-striped'],
    [555, 'darmanitan-standard'],
    [678, 'meowstic-male'],
    [710, 'pumpkaboo-average'],
    [711, 'gourgeist-average'],
    [902, 'basculegion-male'],
    [916, 'oinkologne-male'],
    [925, 'maushold-family-of-four'],
    [964, 'palafin-zero'],
    [982, 'dudunsparce-two-segment'],
  ])('resolves species %i to %s', (id, name) => {
    expect(defaultPokemonName(id, index.pokemon, 'species')).toBe(name);
  });

  it('falls back to the species name when the snapshot has no match', () => {
    expect(defaultPokemonName(849, [], 'toxtricity')).toBe('toxtricity');
    expect(
      defaultPokemonName(849, [{ ...index.pokemon[0]!, id: 1 }], 'toxtricity')
    ).toBe('toxtricity');
  });
});

describe('buildEvolutionTree', () => {
  const step = (
    id: number,
    name: string,
    evolves_to: ChainLink[] = [],
    details: ChainLink['evolution_details'] = []
  ): ChainLink => ({
    ...link(id, name, evolves_to),
    evolution_details: details,
  });

  it('nests the stages and keeps each edge detail', () => {
    const tree = buildEvolutionTree(
      step(1, 'bulbasaur', [
        step(2, 'ivysaur', [step(3, 'venusaur', [], [lvl(32)])], [lvl(16)]),
      ])
    );
    expect(tree?.id).toBe(1);
    expect(tree?.children[0]?.details).toEqual([lvl(16)]);
    expect(tree?.children[0]?.children[0]?.id).toBe(3);
    expect(tree?.children[0]?.children[0]?.children).toEqual([]);
  });

  it('gives Eevee 8 branches', () => {
    const ids = [134, 135, 136, 196, 197, 470, 471, 700];
    const tree = buildEvolutionTree(
      step(
        133,
        'eevee',
        ids.map((id) => step(id, `eeveelution-${id}`))
      )
    );
    expect(tree?.children.map((child) => child.id)).toEqual(ids);
  });

  it('splits Wurmple into two two-stage branches', () => {
    const tree = buildEvolutionTree(
      step(265, 'wurmple', [
        step(266, 'silcoon', [step(267, 'beautifly')]),
        step(268, 'cascoon', [step(269, 'dustox')]),
      ])
    );
    expect(
      tree?.children.map((child) => [child.id, child.children[0]?.id])
    ).toEqual([
      [266, 267],
      [268, 269],
    ]);
  });

  it('puts regional evolutions under their real parent with a note', () => {
    const tree = buildEvolutionTree(
      step(52, 'meowth', [step(53, 'persian'), step(863, 'perrserker')])
    );
    const [persian, perrserker] = tree?.children ?? [];
    expect(persian?.regionNote).toBeUndefined();
    expect(perrserker?.regionNote).toBe('Galarian Meowth only');
  });

  it('flags baby stages and drops stages above the dex ceiling', () => {
    const tree = buildEvolutionTree({
      ...step(172, 'pichu', [step(10001, 'form'), step(25, 'pikachu')]),
      is_baby: true,
    });
    expect(tree?.isBaby).toBe(true);
    expect(tree?.children.map((child) => child.id)).toEqual([25]);
    expect(buildEvolutionTree(step(10001, 'form'))).toBeNull();
  });
});
