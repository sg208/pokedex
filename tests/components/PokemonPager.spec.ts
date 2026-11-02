import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { QueryClient, useQueryClient } from '@tanstack/vue-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PokemonPager from '~/components/PokemonPager.vue';

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
mockNuxtImport('$fetch', () => fetchMock);

const names = Array.from({ length: 1025 }, (_, index) => `mon-${index + 1}`);

afterEach(() => {
  vi.restoreAllMocks();
  useNuxtApp()
    .vueApp.runWithContext(() => useQueryClient())
    .clear();
  fetchMock.mockReset();
});

const mountPager = async (
  name: string
): ReturnType<typeof mountSuspended<typeof PokemonPager>> => {
  fetchMock.mockImplementation(async (url: string) => {
    if (url.includes('dex-index')) {
      return {
        types: ['normal'],
        chart: [[1]],
        forms: [],
        moves: {},
        versionGroups: {},
        pokemon: names.map((entry, index) => ({
          id: index + 1,
          name: entry,
          displayName: `Display ${index + 1}`,
        })),
      };
    }
    return {
      count: 1025,
      next: null,
      previous: null,
      results: names.map((entry, index) => ({
        name: entry,
        url: `https://pokeapi.co/api/v2/pokemon/${index + 1}/`,
      })),
    };
  });
  const wrapper = await mountSuspended(PokemonPager, { props: { name } });
  await vi.waitFor(() => expect(wrapper.find('a').exists()).toBe(true));
  return wrapper;
};

describe('PokemonPager', () => {
  it('links to the previous and next Pokémon by dex order', async () => {
    const wrapper = await mountPager('mon-25');
    expect(wrapper.find('a[href="/pokemon/mon-24"]').text()).toContain('#0024');
    expect(wrapper.find('a[href="/pokemon/mon-26"]').text()).toContain('#0026');
  });

  it('shows snapshot display names once the snapshot loads', async () => {
    const wrapper = await mountPager('mon-25');
    await vi.waitFor(() => {
      expect(wrapper.find('a[href="/pokemon/mon-26"]').text()).toContain(
        'Display 26'
      );
    });
    expect(wrapper.find('a[href="/pokemon/mon-24"]').text()).toContain(
      'Display 24'
    );
  });

  it('has no previous link at #1', async () => {
    const wrapper = await mountPager('mon-1');
    expect(wrapper.findAll('a')).toHaveLength(1);
    expect(wrapper.find('a[href="/pokemon/mon-2"]').exists()).toBe(true);
  });

  it('has no next link at #1025', async () => {
    const wrapper = await mountPager('mon-1025');
    expect(wrapper.findAll('a')).toHaveLength(1);
    expect(wrapper.find('a[href="/pokemon/mon-1024"]').exists()).toBe(true);
  });

  it('prefetches the neighbour on press and focus', async () => {
    const fetchQuery = vi
      .spyOn(QueryClient.prototype, 'fetchQuery')
      .mockRejectedValue(new Error('stop after the first request'));
    vi.spyOn(QueryClient.prototype, 'prefetchQuery').mockResolvedValue(
      undefined
    );
    const wrapper = await mountPager('mon-25');
    await wrapper.find('a[href="/pokemon/mon-26"]').trigger('pointerdown');
    await wrapper.find('a[href="/pokemon/mon-24"]').trigger('focus');
    const keys = fetchQuery.mock.calls.map(
      (call) => (call[0] as { queryKey: unknown }).queryKey
    );
    expect(keys).toContainEqual(['pokemon', 'detail', 'mon-26']);
    expect(keys).toContainEqual(['pokemon', 'detail', 'mon-24']);
  });
});
