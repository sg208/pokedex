import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import PokemonFacts from '~/components/PokemonFacts.vue';

describe('PokemonFacts', () => {
  it('renders height, weight and base experience as labelled term/value pairs', async () => {
    const wrapper = await mountSuspended(PokemonFacts, {
      props: { height: 4, weight: 60, baseExperience: 112 },
    });
    expect(wrapper.findAll('dt').map((term) => term.text())).toEqual([
      'Height',
      'Weight',
      'Base experience',
    ]);
    const values = wrapper.findAll('dd').map((value) => value.text());
    expect(values).toHaveLength(3);
    expect(values[2]).toBe('112');
  });

  it('shows n/a when base experience is missing', async () => {
    const wrapper = await mountSuspended(PokemonFacts, {
      props: { height: 4, weight: 60, baseExperience: null },
    });
    expect(wrapper.findAll('dd')[2]?.text()).toBe('n/a');
  });
});
