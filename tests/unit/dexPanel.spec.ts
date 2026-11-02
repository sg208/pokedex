import { describe, expect, it } from 'vitest';
import {
  baseStatTotal,
  formatEvYield,
  formatGeneration,
  formatGenderRatio,
  formatHatchSteps,
  pickRarityBadge,
} from '~/utils/dexPanel';

const stat = (
  name: string,
  base: number,
  effort = 0
): {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
} => ({
  base_stat: base,
  effort,
  stat: { name, url: '' },
});

describe('dex panel helpers', () => {
  it('formats the gender ratio', () => {
    expect(formatGenderRatio(-1)).toBe('Genderless');
    expect(formatGenderRatio(1)).toBe('87.5% male, 12.5% female');
    expect(formatGenderRatio(4)).toBe('50% male, 50% female');
    expect(formatGenderRatio(0)).toBe('100% male');
    expect(formatGenderRatio(8)).toBe('100% female');
  });

  it('counts hatch steps as (counter + 1) * 255', () => {
    expect(formatHatchSteps(20)).toBe('5,355');
    expect(formatHatchSteps(0)).toBe('255');
  });

  it('lists the EV yield, and says none when empty', () => {
    expect(formatEvYield([stat('hp', 35, 0), stat('speed', 90, 2)])).toBe(
      '2 Speed'
    );
    expect(
      formatEvYield([stat('hp', 35, 1), stat('special-attack', 5, 2)])
    ).toBe('1 HP, 2 Sp. Atk');
    expect(formatEvYield([stat('hp', 35, 0)])).toBe('None');
  });

  it('names the generation', () => {
    expect(formatGeneration('generation-v')).toBe('Generation V');
    expect(formatGeneration('generation-ix')).toBe('Generation IX');
    expect(formatGeneration('odd')).toBe('odd');
  });

  it('picks the badge: mythical, then legendary, then baby', () => {
    const none = { is_mythical: false, is_legendary: false, is_baby: false };
    expect(pickRarityBadge(none)).toBeNull();
    expect(pickRarityBadge({ ...none, is_baby: true })).toBe('Baby');
    expect(
      pickRarityBadge({ ...none, is_baby: true, is_legendary: true })
    ).toBe('Legendary');
    expect(
      pickRarityBadge({ is_mythical: true, is_legendary: true, is_baby: true })
    ).toBe('Mythical');
  });

  it('sums the base stats', () => {
    expect(baseStatTotal([stat('hp', 35), stat('speed', 90)])).toBe(125);
    expect(baseStatTotal([])).toBe(0);
  });
});
