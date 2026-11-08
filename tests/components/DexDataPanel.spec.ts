import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { VueWrapper } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import DexDataPanel from '~/components/DexDataPanel.vue';

const resource = (name: string): { name: string; url: string } => ({
  name,
  url: '',
});

const species = {
  is_baby: false,
  is_legendary: false,
  is_mythical: false,
  generation: resource('generation-v'),
  capture_rate: 190,
  gender_rate: 1,
  egg_groups: [resource('water-1'), resource('amorphous')],
  hatch_counter: 20,
  base_happiness: 50,
  growth_rate: resource('medium-slow'),
  has_gender_differences: true,
};

const stats = [
  { base_stat: 55, effort: 0, stat: resource('hp') },
  { base_stat: 90, effort: 2, stat: resource('speed') },
];

const rows = (wrapper: VueWrapper): Record<string, string> => {
  const values = wrapper.findAll('dd');
  return Object.fromEntries(
    wrapper
      .findAll('dt')
      .map((term, position) => [term.text(), values[position]?.text() ?? ''])
  );
};

describe('DexDataPanel', () => {
  it('shows every dex fact as a labelled term/value pair', async () => {
    const wrapper = await mountSuspended(DexDataPanel, {
      props: { species, stats },
    });
    expect(rows(wrapper)).toEqual({
      Generation: 'Generation V',
      'Catch rate': '190',
      'Gender ratio': '87.5% male, 12.5% female',
      'Egg groups': 'water 1, amorphous',
      'Hatch steps': '5,355',
      'Base friendship': '50',
      'Growth rate': 'medium slow',
      'EV yield': '2 Speed',
      'Base stat total': '145',
      'Visible gender differences': 'Yes',
    });
    expect(wrapper.find('.rarity-badge').exists()).toBe(false);
  });

  it('shows the rarity badge, genderless, and n/a for missing friendship', async () => {
    const wrapper = await mountSuspended(DexDataPanel, {
      props: {
        species: {
          ...species,
          is_legendary: true,
          gender_rate: -1,
          base_happiness: null,
          has_gender_differences: false,
          egg_groups: [resource('no-eggs')],
        },
        stats,
      },
    });
    expect(wrapper.find('.rarity-badge').text()).toBe('Legendary');
    expect(rows(wrapper)['Gender ratio']).toBe('Genderless');
    expect(rows(wrapper)['Base friendship']).toBe('n/a');
    expect(rows(wrapper)['Visible gender differences']).toBe('No');
  });

  it('lists many egg groups without dropping any', async () => {
    const wrapper = await mountSuspended(DexDataPanel, {
      props: {
        species: {
          ...species,
          egg_groups: [
            resource('monster'),
            resource('dragon'),
            resource('field'),
          ],
        },
        stats,
      },
    });
    expect(rows(wrapper)['Egg groups']).toBe('monster, dragon, field');
  });

  it('announces loading while the species has not arrived', async () => {
    const wrapper = await mountSuspended(DexDataPanel, { props: { stats } });
    const placeholder = wrapper.find('[aria-busy="true"]');
    expect(placeholder.find('.sr-only').text()).toBe('Loading…');
  });
});
