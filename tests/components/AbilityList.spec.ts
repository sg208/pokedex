import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { useQueryClient } from '@tanstack/vue-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AbilityList from '~/components/AbilityList.vue';

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
mockNuxtImport('$fetch', () => fetchMock);

const API = 'https://pokeapi.co/api/v2';
const abilities = [
  { ability: { name: 'static', url: '' }, is_hidden: false },
  { ability: { name: 'lightning-rod', url: '' }, is_hidden: true },
];
const LONG =
  'Has a 30% chance of paralyzing attacking Pokémon on contact, and then a very long sentence follows that keeps going and going so the row has to wrap onto several lines without breaking the layout of the list.';

const effect = (short_effect: string): unknown => ({
  name: 'x',
  effect_entries: [
    { effect: 'long', short_effect: 'Ein Effekt', language: { name: 'de' } },
    { effect: 'long', short_effect, language: { name: 'en' } },
  ],
});

afterEach(() => {
  useNuxtApp()
    .vueApp.runWithContext(() => useQueryClient())
    .clear();
  fetchMock.mockReset();
});

describe('AbilityList', () => {
  it('shows the English short effect per ability and marks the hidden one', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url === `${API}/ability/static`
        ? effect(LONG)
        : effect('Boosts Electric moves when hit.')
    );
    const wrapper = await mountSuspended(AbilityList, { props: { abilities } });
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain(LONG);
    });
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Boosts Electric moves when hit.');
    });
    expect(wrapper.text()).not.toContain('Ein Effekt');
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(2);
    expect(items[0]?.text()).toContain('static');
    expect(items[0]?.text()).not.toContain('Hidden ability');
    expect(items[1]?.text()).toContain('Hidden ability');
  });

  it('shows a loading note while the effect is on its way', async () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    const wrapper = await mountSuspended(AbilityList, { props: { abilities } });
    expect(wrapper.findAll('li')).toHaveLength(2);
    expect(wrapper.text()).toContain('Loading effect');
    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true);
  });

  it('falls back to text for a failed ability and keeps the others', async () => {
    // WHY: the app client retries twice with backoff; skip it so the error state shows at once
    useNuxtApp()
      .vueApp.runWithContext(() => useQueryClient())
      .setDefaultOptions({ queries: { retry: false } });
    fetchMock.mockImplementation(async (url: string) => {
      if (url === `${API}/ability/static`) throw new Error('offline');
      return effect('Boosts Electric moves when hit.');
    });
    const wrapper = await mountSuspended(AbilityList, { props: { abilities } });
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Effect description unavailable.');
    });
    expect(wrapper.text()).toContain('Boosts Electric moves when hit.');
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('uses the same text fallback when no English entry exists', async () => {
    fetchMock.mockResolvedValue({
      name: 'x',
      effect_entries: [
        { effect: 'a', short_effect: 'b', language: { name: 'de' } },
      ],
    });
    const wrapper = await mountSuspended(AbilityList, {
      props: { abilities: [abilities[0]!] },
    });
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Effect description unavailable.');
    });
  });
});
