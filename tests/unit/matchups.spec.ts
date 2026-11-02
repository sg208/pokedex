import { describe, expect, it } from 'vitest';
import type { DexIndex, DexIndexPokemon } from '~/types/pokemon';
import {
  bestHit,
  defensiveMultiplier,
  findMatchups,
  formatMultiplier,
} from '~/utils/matchups';
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

  it('lists regular abilities for every Pokémon', () => {
    expect(
      index.pokemon.every(
        (mon) =>
          Array.isArray(mon.abilities) &&
          mon.abilities.length > 0 &&
          mon.abilities.every((ability) => typeof ability === 'string')
      )
    ).toBe(true);
    expect(byName('rotom').abilities).toEqual(['levitate']);
    expect(byName('shedinja').abilities).toEqual(['wonder-guard']);
    expect(byName('pikachu').abilities).toEqual(['static']);
  });

  it('carries display names, generation, rarity and stats', () => {
    const nameOf = (id: number): string | undefined =>
      index.pokemon[id - 1]?.displayName;
    expect([29, 83, 122, 250, 641].map(nameOf)).toEqual([
      'Nidoran♀',
      'Farfetch’d',
      'Mr. Mime',
      'Ho-Oh',
      'Tornadus',
    ]);
    expect(index.pokemon.filter((mon) => mon.generation === 1)).toHaveLength(
      151
    );
    expect(
      index.pokemon.every(
        (mon) =>
          mon.stats.length === 6 &&
          mon.stats.every((value) => Number.isInteger(value) && value > 0) &&
          mon.stats.reduce((sum, value) => sum + value, 0) === mon.bst &&
          typeof mon.isLegendary === 'boolean' &&
          typeof mon.isMythical === 'boolean'
      )
    ).toBe(true);
    expect(index.pokemon[149]).toMatchObject({
      isLegendary: true,
      isMythical: false,
    });
    expect(index.pokemon[24]).toMatchObject({
      isLegendary: false,
      isMythical: false,
    });
    expect(index.pokemon[150]).toMatchObject({ isMythical: true });
    expect(index.pokemon[149]?.stats).toEqual([106, 110, 90, 154, 90, 130]);
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

describe('ability-aware hits', () => {
  it('lets Levitate cancel a Ground hit', () => {
    expect(bestHit(['ground'], ['electric', 'ghost'], index)).toBe(2);
    expect(
      bestHit(['ground'], ['electric', 'ghost'], index, ['levitate'])
    ).toBe(0);
  });

  it('lets Wonder Guard stop everything that is not super effective', () => {
    expect(
      defensiveMultiplier('normal', ['bug', 'ghost'], ['wonder-guard'], index)
    ).toBe(0);
    expect(
      defensiveMultiplier('fire', ['bug', 'ghost'], ['wonder-guard'], index)
    ).toBe(2);
    expect(defensiveMultiplier('fire', ['bug', 'ghost'], [], index)).toBe(2);
    expect(
      defensiveMultiplier('grass', ['bug', 'ghost'], ['wonder-guard'], index)
    ).toBe(0);
    expect(defensiveMultiplier('grass', ['bug', 'ghost'], [], index)).toBe(0.5);
  });

  it('keeps Rotom nemeses off Ground alone and Garchomp at ×1', () => {
    const rotom = byName('rotom');
    const { nemeses } = findMatchups(rotom, index);
    expect(nemeses.length).toBeGreaterThan(0);
    for (const matchup of nemeses) {
      expect(
        bestHit(matchup.pokemon.types, rotom.types, index, rotom.abilities)
      ).toBe(matchup.dealt);
    }
    expect(
      nemeses.every(
        (matchup) =>
          matchup.pokemon.types.some((type) => type !== 'ground') ||
          matchup.dealt === 0
      )
    ).toBe(true);
    const garchomp = byName('garchomp');
    expect(bestHit(garchomp.types, rotom.types, index, rotom.abilities)).toBe(
      1
    );
  });

  it('finds Shedinja nemeses only when a close peer hits super effectively', () => {
    // Diagnosis: the real snapshot has just three fully evolved peers within
    // 35% of Shedinja's base stat total of 236, and none of them hits for ×2
    // through Wonder Guard, so the empty list is a band effect, not an ability bug.
    const shedinja = byName('shedinja');
    const realPeers = findMatchups(shedinja, index);
    expect(realPeers.bstBand).toBe(0.35);
    expect(realPeers.nemeses).toEqual([]);

    const rockPeer: DexIndexPokemon = {
      ...byName('relicanth'),
      id: 9001,
      bst: 240,
      isFinal: true,
    };
    const { nemeses } = findMatchups(
      shedinja,
      { ...index, pokemon: [shedinja, rockPeer] },
      1
    );
    expect(nemeses).toHaveLength(1);
    expect(nemeses.every((matchup) => matchup.dealt >= 2)).toBe(true);
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
