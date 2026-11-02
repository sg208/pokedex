import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import IndexPage from '~/pages/index.vue';

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
mockNuxtImport('$fetch', () => fetchMock);

fetchMock.mockImplementation(async (url: string) => {
  if (url.includes('/type/')) {
    return {
      name: 'fire',
      pokemon: [
        {
          slot: 1,
          pokemon: {
            name: 'charmander',
            url: 'https://pokeapi.co/api/v2/pokemon/4/',
          },
        },
      ],
    };
  }
  return {
    count: 1025,
    next: null,
    previous: null,
    results: [
      { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
    ],
  };
});

describe('index page', () => {
  it('has one h1 and a Browse all button that jumps to the index', async () => {
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.findAll('h1')).toHaveLength(1);
    expect(wrapper.find('h1').text()).toContain('Gotta');
    expect(wrapper.find('h1').text()).toContain("find 'em");
    expect(wrapper.find('a[href="#index"]').text()).toBe('Browse all');
  });

  it('gives every section a heading and chapter colours', async () => {
    const wrapper = await mountSuspended(IndexPage);
    const chapters = wrapper.findAll('[data-chapter]');
    expect(chapters.length).toBeGreaterThanOrEqual(2);
    chapters.forEach((chapter) => {
      expect(chapter.find('h1, h2').exists()).toBe(true);
      expect(chapter.attributes('data-bg')).toMatch(/^#[0-9a-f]{6}$/);
      expect(chapter.attributes('data-ink')).toMatch(/^#[0-9a-f]{6}$/);
    });
    expect(wrapper.find('#index h2').text()).toBe('Index');
  });

  it('lists Pokémon from the first page', async () => {
    const wrapper = await mountSuspended(IndexPage);
    await vi.waitFor(() => {
      expect(wrapper.findAll('a[href^="/pokemon/"]')).toHaveLength(2);
    });
    expect(wrapper.text()).toContain('#0004');
  });

  it('colours a card with its primary type once the type lists load', async () => {
    const wrapper = await mountSuspended(IndexPage);
    await vi.waitFor(() => {
      const style = wrapper
        .find('a[href="/pokemon/charmander"]')
        .attributes('style');
      expect(style).toMatch(/#ee8130|rgb\(238, 129, 48\)/);
    });
    expect(
      wrapper.find('a[href="/pokemon/bulbasaur"]').attributes('style')
    ).not.toMatch(/#ee8130|rgb\(238, 129, 48\)/);
  });

  it('filters the grid by type chip and shows the no-match state', async () => {
    const wrapper = await mountSuspended(IndexPage);
    await vi.waitFor(() => {
      expect(wrapper.findAll('a[href^="/pokemon/"]')).toHaveLength(2);
    });
    const chips = wrapper.findAll('button[aria-pressed]');
    await chips.find((chip) => chip.text() === 'fire')?.trigger('click');
    await vi.waitFor(() => {
      const links = wrapper.findAll('a[href^="/pokemon/"]');
      expect(links.map((link) => link.attributes('href'))).toEqual([
        '/pokemon/charmander',
      ]);
    });

    await chips.find((chip) => chip.text() === 'water')?.trigger('click');
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('No Pokémon match');
    });
  });

  it('describes what the site is in one plain sentence', async () => {
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.text()).toContain('1,025 Pokémon');
    expect(wrapper.text()).toContain('PokeAPI');
  });
});
