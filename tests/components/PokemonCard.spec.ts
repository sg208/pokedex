import { QueryClient } from '@tanstack/vue-query';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PokemonCard from '~/components/PokemonCard.vue';
import { pokemonKeys } from '~/composables/queries/pokemonQueries';

afterEach(() => vi.restoreAllMocks());

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
    expect(img.attributes('alt')).toBe('pikachu');
    expect(img.attributes('src')).toContain('official-artwork/25.png');
    expect(img.attributes('loading')).toBe('lazy');
    expect(img.attributes('width')).toBeTruthy();
    expect(img.attributes('height')).toBeTruthy();
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

  it('prefetches the detail on hover and on focus', async () => {
    const prefetch = vi
      .spyOn(QueryClient.prototype, 'prefetchQuery')
      .mockResolvedValue(undefined);
    const wrapper = await mountCard();

    await wrapper.find('a').trigger('mouseenter');
    expect(prefetch).toHaveBeenCalledTimes(1);
    expect(prefetch.mock.calls[0]?.[0]).toMatchObject({
      queryKey: pokemonKeys.detail('pikachu'),
    });

    await wrapper.find('a').trigger('focus');
    expect(prefetch).toHaveBeenCalledTimes(2);
  });

  it('does not prefetch without interaction', async () => {
    const prefetch = vi
      .spyOn(QueryClient.prototype, 'prefetchQuery')
      .mockResolvedValue(undefined);
    await mountCard();
    expect(prefetch).not.toHaveBeenCalled();
  });
});
