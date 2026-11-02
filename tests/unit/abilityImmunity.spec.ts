import { describe, expect, it } from 'vitest';
import { guaranteedImmunities } from '~/utils/abilityImmunity';

describe('guaranteedImmunities', () => {
  it('grants the type of a lone ability', () => {
    expect(guaranteedImmunities(['levitate'])).toEqual({
      types: ['ground'],
      hasWonderGuard: false,
    });
    expect(guaranteedImmunities(['sap-sipper']).types).toEqual(['grass']);
    expect(guaranteedImmunities(['motor-drive']).types).toEqual(['electric']);
  });

  it('keeps the type when every ability grants the same one', () => {
    expect(
      guaranteedImmunities(['volt-absorb', 'lightning-rod']).types
    ).toEqual(['electric']);
    expect(guaranteedImmunities(['levitate', 'earth-eater']).types).toEqual([
      'ground',
    ]);
  });

  it('grants nothing when abilities differ or one is unrelated', () => {
    expect(guaranteedImmunities(['flash-fire', 'early-bird'])).toEqual({
      types: [],
      hasWonderGuard: false,
    });
    expect(guaranteedImmunities(['levitate', 'water-absorb']).types).toEqual(
      []
    );
    expect(guaranteedImmunities(['static']).types).toEqual([]);
    expect(guaranteedImmunities([]).types).toEqual([]);
  });

  it('flags Wonder Guard only as the sole regular ability', () => {
    expect(guaranteedImmunities(['wonder-guard'])).toEqual({
      types: [],
      hasWonderGuard: true,
    });
    expect(guaranteedImmunities(['wonder-guard', 'levitate'])).toEqual({
      types: [],
      hasWonderGuard: false,
    });
  });
});
