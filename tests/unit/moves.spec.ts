import { describe, expect, it } from 'vitest';
import type { PokemonMove } from '~/types/pokemon';
import {
  formatLearnLevel,
  movePowerPercent,
  pickLevelUpMoves,
} from '~/utils/moves';

const learn = (
  name: string,
  details: [level: number, method: string, group: string][]
): PokemonMove => ({
  move: { name, url: '' },
  version_group_details: details.map(([level, method, group]) => ({
    level_learned_at: level,
    move_learn_method: { name: method, url: '' },
    version_group: { name: group, url: '' },
  })),
});

const order = { 'red-blue': 1, 'sword-shield': 20, 'scarlet-violet': 27 };
const index = {
  'thunder-shock': { type: 'electric', power: 40, damageClass: 'special' },
  growl: { type: 'normal', power: null, damageClass: 'status' },
  thunder: { type: 'electric', power: 110, damageClass: 'special' },
};

describe('pickLevelUpMoves', () => {
  it('keeps only level-up moves from the newest game that has any', () => {
    const result = pickLevelUpMoves(
      [
        learn('thunder', [
          [43, 'level-up', 'red-blue'],
          [44, 'level-up', 'sword-shield'],
        ]),
        learn('growl', [[1, 'level-up', 'sword-shield']]),
        learn('thunder-shock', [
          [0, 'machine', 'scarlet-violet'],
          [1, 'level-up', 'sword-shield'],
        ]),
      ],
      order,
      index
    );
    expect(result.versionGroup).toBe('sword-shield');
    expect(result.moves.map((move) => [move.level, move.name])).toEqual([
      [1, 'growl'],
      [1, 'thunder-shock'],
      [44, 'thunder'],
    ]);
    expect(result.moves[2]).toMatchObject({
      type: 'electric',
      power: 110,
      damageClass: 'special',
    });
  });

  it('falls back to a status normal move when the snapshot lacks it', () => {
    const result = pickLevelUpMoves(
      [learn('brand-new-move', [[5, 'level-up', 'scarlet-violet']])],
      order,
      index
    );
    expect(result.moves[0]).toMatchObject({
      type: 'normal',
      power: null,
      damageClass: 'status',
    });
  });

  it('returns no group and no moves when nothing is learned by level', () => {
    expect(
      pickLevelUpMoves([learn('growl', [[0, 'tutor', 'red-blue']])], order, {})
    ).toEqual({ versionGroup: null, moves: [] });
  });
});

describe('formatLearnLevel', () => {
  it('shows level 0 as Evo', () => {
    expect(formatLearnLevel(0)).toBe('Evo');
    expect(formatLearnLevel(12)).toBe('12');
  });
});

describe('movePowerPercent', () => {
  it('scales power against 250 and clamps', () => {
    expect(movePowerPercent(null)).toBe(0);
    expect(movePowerPercent(125)).toBe(50);
    expect(movePowerPercent(300)).toBe(100);
  });
});
