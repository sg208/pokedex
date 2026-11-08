import { QueryClient } from '@tanstack/vue-query';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PokemonCard from '~/components/PokemonCard.vue';
import { pokemonKeys } from '~/composables/queries/pokemonQueries';
import { HOVER_INTENT_MS } from '~/composables/usePokemonPrefetch';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const mountCard = (
  props = {}
): ReturnType<typeof mountSuspended<typeof PokemonCard>> =>
  mountSuspended(PokemonCard, {
    props: {
      id: 25,
      name: 'pikachu',
      index: 0,
      typeName: 'electric',
      ...props,
    },
  });

describe('PokemonCard', () => {
  it('links to the detail page and shows name, number and artwork', async () => {
    const wrapper = await mountCard();
    const link = wrapper.find('a');
    expect(link.attributes('href')).toBe('/pokemon/pikachu');
    expect(wrapper.text()).toContain('#0025');
    expect(wrapper.text()).toContain('pikachu');
    const img = wrapper.find('img');
    expect(img.attributes('alt')).toBe('');
    expect(img.attributes('src')).toContain('official-artwork/25.png');
    expect(img.attributes('loading')).toBe('lazy');
    expect(img.attributes('width')).toBeTruthy();
    expect(img.attributes('height')).toBeTruthy();
  });

  it('shows the display name when given and the slug before that', async () => {
    const named = await mountCard({
      id: 122,
      name: 'mr-mime',
      displayName: 'Mr. Mime',
    });
    expect(named.text()).toContain('Mr. Mime');
    expect(named.find('img').attributes('alt')).toBe('');
    expect(named.find('a').attributes('href')).toBe('/pokemon/mr-mime');
    const plain = await mountCard({ id: 122, name: 'mr-mime' });
    expect(plain.text()).toContain('mr mime');
    expect(plain.text()).not.toContain('Mr. Mime');
  });

  it('takes the primary type colours and falls back to a neutral field', async () => {
    const typed = await mountCard();
    expect(typed.find('a').attributes('style')).toContain('#f7d02c');
    const neutral = await mountCard({ typeName: undefined });
    expect(neutral.find('a').attributes('style')).toContain('#dcd5c5');
  });

  it('tilts artwork in alternating directions', async () => {
    const even = await mountCard({ index: 0 });
    const odd = await mountCard({ index: 1 });
    const evenTilt = even.find('img').attributes('style') ?? '';
    const oddTilt = odd.find('img').attributes('style') ?? '';
    expect(evenTilt).toContain('--tilt: 4deg');
    expect(oddTilt).toContain('--tilt: -5deg');
  });

  it('prefetches the detail after a short hover, and at once on focus', async () => {
    const fetchQuery = vi
      .spyOn(QueryClient.prototype, 'fetchQuery')
      .mockRejectedValue(new Error('stop after the first request'));
    vi.spyOn(QueryClient.prototype, 'prefetchQuery').mockResolvedValue(
      undefined
    );
    const wrapper = await mountCard();
    vi.useFakeTimers();

    await wrapper.find('a').trigger('pointerenter');
    expect(fetchQuery).not.toHaveBeenCalled();
    vi.advanceTimersByTime(HOVER_INTENT_MS);
    expect(fetchQuery).toHaveBeenCalledTimes(1);
    expect(fetchQuery.mock.calls[0]?.[0]).toMatchObject({
      queryKey: pokemonKeys.detail('pikachu'),
    });

    await wrapper.find('a').trigger('focus');
    expect(fetchQuery).toHaveBeenCalledTimes(2);
  });

  it('skips the prefetch when the pointer only passes over', async () => {
    const fetchQuery = vi
      .spyOn(QueryClient.prototype, 'fetchQuery')
      .mockRejectedValue(new Error('unused'));
    const wrapper = await mountCard();
    vi.useFakeTimers();
    await wrapper.find('a').trigger('pointerenter');
    await wrapper.find('a').trigger('pointerleave');
    vi.advanceTimersByTime(HOVER_INTENT_MS * 2);
    expect(fetchQuery).not.toHaveBeenCalled();
  });

  it('does not prefetch without interaction', async () => {
    const prefetch = vi
      .spyOn(QueryClient.prototype, 'prefetchQuery')
      .mockResolvedValue(undefined);
    const fetchQuery = vi.spyOn(QueryClient.prototype, 'fetchQuery');
    await mountCard();
    expect(prefetch).not.toHaveBeenCalled();
    expect(fetchQuery).not.toHaveBeenCalled();
  });
});
