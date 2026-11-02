import { describe, expect, it } from 'vitest';
import type { DexIndex, DexIndexPokemon } from '~/types/pokemon';
import { bestHit, findMatchups, formatMultiplier } from '~/utils/matchups';
import snapshot from '~/public/data/dex-index.json';

const index = snapshot as DexIndex;
const byName = (name: string): DexIndexPokemon => {
  const found = index.pokemon.find((mon) => mon.name === name);
  if (!found) throw new Error(`missing ${name}`);
  return found;
};

describe('dex-index snapshot', () => {
  it('holds the national dex and an 18 by 18 type chart', () => {
    expect(index.pokemon).toHaveLength(1025);
    expect(index.chart).toHaveLength(18);
    expect(index.chart.every((row) => row.length === 18)).toBe(true);
  });

  it('marks evolution standing', () => {
    expect(byName('bulbasaur')).toMatchObject({ stage: 0, isFinal: false });
    expect(byName('venusaur')).toMatchObject({ stage: 2, isFinal: true });
    expect(byName('tauros')).toMatchObject({ stage: 0, isFinal: true });
  });
});

describe('bestHit', () => {
  it('multiplies across both defending types', () => {
    expect(bestHit(['ice'], ['dragon', 'flying'], index)).toBe(4);
    expect(bestHit(['electric'], ['ground'], index)).toBe(0);
    expect(bestHit(['normal', 'fighting'], ['rock', 'steel'], index)).toBe(4);
  });
});

describe('findMatchups', () => {
  it('ranks five type-edge opponents each way among close peers', () => {
    const target = byName('charizard');
    const { nemeses, prey, bstBand } = findMatchups(target, index);
    expect(nemeses).toHaveLength(5);
    expect(prey).toHaveLength(5);
    for (const matchup of [...nemeses, ...prey]) {
      expect(matchup.pokemon.isFinal).toBe(true);
      expect(Math.abs(matchup.pokemon.bst - target.bst)).toBeLessThanOrEqual(
        target.bst * bstBand
      );
      expect(matchup.pokemon.id).not.toBe(target.id);
    }
    // Rock hits fire/flying ×4
    expect(nemeses[0]?.dealt).toBe(4);
    expect(nemeses.every((matchup) => matchup.edge > 0)).toBe(true);
    expect(prey.every((matchup) => matchup.edge < 0)).toBe(true);
  });

  it('keeps unevolved Pokémon among unevolved peers', () => {
    const { nemeses, prey } = findMatchups(byName('charmander'), index);
    expect(
      [...nemeses, ...prey].every((matchup) => !matchup.pokemon.isFinal)
    ).toBe(true);
  });
});

describe('formatMultiplier', () => {
  it('writes multipliers with a times sign', () => {
    expect(formatMultiplier(0)).toBe('×0');
    expect(formatMultiplier(0.25)).toBe('×0.25');
    expect(formatMultiplier(4)).toBe('×4');
  });
});
