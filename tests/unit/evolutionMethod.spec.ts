import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { DexIndex, EvolutionDetail } from '~/types/pokemon';
import { REGIONAL_ONLY, evolutionMethod } from '~/utils/evolutionMethod';

const res = (name: string): { name: string; url: string } => ({
  name,
  url: '',
});
const detail = (
  trigger: string,
  extra: Partial<EvolutionDetail> = {}
): EvolutionDetail => ({ trigger: res(trigger), ...extra });

describe('evolutionMethod', () => {
  it.each([
    [[detail('level-up', { min_level: 16 })], 'Lv 16'],
    [[detail('use-item', { item: res('water-stone') })], 'Water Stone'],
    [
      [detail('level-up', { min_happiness: 220, time_of_day: 'day' })],
      'Friendship, day',
    ],
    [
      [detail('trade', { held_item: res('metal-coat') })],
      'Trade holding Metal Coat',
    ],
    [[detail('trade')], 'Trade'],
    [[detail('level-up')], 'Level up'],
    [[], ''],
    [
      [detail('level-up', { known_move: res('ancient-power') })],
      'Level up, knowing Ancient Power',
    ],
    [
      [
        detail('level-up', {
          known_move_type: res('fairy'),
          min_happiness: 160,
        }),
      ],
      'Friendship, knowing a Fairy-type move',
    ],
    [[detail('level-up', { min_level: 20, gender: 1 })], 'Lv 20, female'],
    [
      [detail('level-up', { min_level: 30, relative_physical_stats: 1 })],
      'Lv 30, Attack above Defense',
    ],
    [
      [detail('level-up', { turn_upside_down: true, min_level: 30 })],
      'Lv 30, console held upside down',
    ],
    [
      [detail('level-up', { needs_overworld_rain: true, min_level: 30 })],
      'Lv 30, while it rains',
    ],
    [
      [detail('level-up', { location: res('mt-coronet') })],
      'Level up, at Mt Coronet',
    ],
    [
      [detail('level-up', { party_species: res('mantine') })],
      'Level up, with Mantine in the party',
    ],
    [[detail('three-critical-hits')], 'Three Critical Hits'],
  ])('describes %j as %s', (details, text) => {
    expect(evolutionMethod(details)).toBe(text);
  });

  it('joins several ways with " or " and drops duplicates', () => {
    expect(
      evolutionMethod([
        detail('level-up', { min_happiness: 220, time_of_day: 'day' }),
        detail('level-up', { min_happiness: 220, time_of_day: 'night' }),
        detail('level-up', { min_happiness: 220, time_of_day: 'night' }),
      ])
    ).toBe('Friendship, day or Friendship, night');
  });
});

describe('REGIONAL_ONLY', () => {
  const index = JSON.parse(
    readFileSync('public/data/dex-index.json', 'utf8')
  ) as DexIndex;

  it.each([
    [862, 'obstagoon'],
    [863, 'perrserker'],
    [864, 'cursola'],
    [865, 'sirfetchd'],
    [866, 'mr-rime'],
    [867, 'runerigus'],
    [903, 'sneasler'],
    [904, 'overqwil'],
    [980, 'clodsire'],
  ])('covers id %i (%s per the snapshot)', (id, name) => {
    expect(index.pokemon[id - 1]?.name).toBe(name);
    expect(REGIONAL_ONLY[id]).toMatch(/ only$/);
  });

  it('has no other entries', () => {
    expect(Object.keys(REGIONAL_ONLY)).toHaveLength(9);
    expect(REGIONAL_ONLY[863]).toBe('Galarian Meowth only');
  });
});
