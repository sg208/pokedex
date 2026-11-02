import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import FlavorPicker from '~/components/FlavorPicker.vue';

const entry = (
  text: string,
  version: string,
  language = 'en'
): {
  flavor_text: string;
  language: { name: string; url: string };
  version: { name: string; url: string };
} => ({
  flavor_text: text,
  language: { name: language, url: '' },
  version: { name: version, url: '' },
});

describe('FlavorPicker', () => {
  it('shows the latest game by default, behind a labelled select', async () => {
    const wrapper = await mountSuspended(FlavorPicker, {
      props: {
        entries: [
          entry('Old text.', 'red'),
          entry('ほげ', 'blue', 'ja'),
          entry('New POKéMON text.', 'sword'),
        ],
      },
    });
    const select = wrapper.find('select');
    expect(wrapper.find('label').text()).toBe('Game');
    expect(wrapper.find('label').attributes('for')).toBe(
      select.attributes('id')
    );
    expect(select.findAll('option').map((option) => option.text())).toEqual([
      'red',
      'sword',
    ]);
    expect((select.element as HTMLSelectElement).value).toBe('sword');
    expect(wrapper.find('p').text()).toBe('New Pokémon text.');
  });

  it('swaps the text when another game is chosen', async () => {
    const wrapper = await mountSuspended(FlavorPicker, {
      props: { entries: [entry('Old text.', 'red'), entry('New.', 'sword')] },
    });
    await wrapper.find('select').setValue('red');
    expect(wrapper.find('p').text()).toBe('Old text.');
  });

  it('shows no select for a single game, and nothing when empty', async () => {
    const one = await mountSuspended(FlavorPicker, {
      props: { entries: [entry('Only.', 'red')] },
    });
    expect(one.find('select').exists()).toBe(false);
    expect(one.find('p').text()).toBe('Only.');

    const none = await mountSuspended(FlavorPicker, {
      props: { entries: [entry('ほげ', 'red', 'ja')] },
    });
    expect(none.find('p').exists()).toBe(false);
    expect(none.find('select').exists()).toBe(false);
  });
});
