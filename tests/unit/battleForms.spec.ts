import { describe, expect, it } from 'vitest';
import type { DexIndex } from '~/types/pokemon';
import { battleFormLabel, pickBattleForms } from '~/utils/battleForms';
import snapshot from '~/public/data/dex-index.json';

const index = snapshot as DexIndex;

describe('battleFormLabel', () => {
  it('reads like the games name the form', () => {
    expect(battleFormLabel('rayquaza-mega', 'mega')).toBe('mega rayquaza');
    expect(battleFormLabel('charizard-mega-x', 'mega')).toBe(
      'mega charizard x'
    );
    expect(battleFormLabel('groudon-primal', 'primal')).toBe('primal groudon');
    expect(battleFormLabel('urshifu-rapid-strike-gmax', 'gmax')).toBe(
      'gigantamax urshifu rapid strike'
    );
    expect(battleFormLabel('urshifu-single-strike-gmax', 'gmax')).toBe(
      'gigantamax urshifu single strike'
    );
  });
});

describe('pickBattleForms', () => {
  it('gives Rayquaza its Mega Evolution with the stat gain', () => {
    expect(pickBattleForms([384], index.forms, index.pokemon)).toEqual([
      {
        id: 10079,
        label: 'mega rayquaza',
        kind: 'mega',
        types: ['dragon', 'flying'],
        bst: 780,
        baseBst: 680,
      },
    ]);
  });

  it('collects every form across the chain in chain order', () => {
    const labels = pickBattleForms([4, 5, 6], index.forms, index.pokemon).map(
      (form) => form.label
    );
    expect(labels).toEqual([
      'mega charizard x',
      'mega charizard y',
      'gigantamax charizard',
    ]);
  });

  it('returns nothing for a chain without battle forms', () => {
    expect(pickBattleForms([19, 20], index.forms, index.pokemon)).toEqual([]);
  });
});
