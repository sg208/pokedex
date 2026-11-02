import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { useQueryClient } from '@tanstack/vue-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import IndexPage from '~/pages/index.vue';

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
mockNuxtImport('$fetch', () => fetchMock);

const fixtureMon = (
  id: number,
  extra: Record<string, unknown> = {}
): Record<string, unknown> => ({
  id,
  name: `mon-${id}`,
  types: ['normal'],
  bst: 300,
  stage: 0,
  isFinal: true,
  abilities: ['run-away'],
  displayName: `Mon ${id}`,
  generation: 1,
  isLegendary: false,
  isMythical: false,
  stats: [50, 50, 50, 50, 50, 50],
  ...extra,
});

// bulbasaur: slow, generation 1; charmander: fast, legendary (fixture only)
const snapshotFixture = {
  types: ['normal'],
  chart: [[1]],
  forms: [],
  moves: {},
  versionGroups: {},
  pokemon: Array.from({ length: 1025 }, (_, i) => {
    if (i === 0) {
      return fixtureMon(1, {
        name: 'bulbasaur',
        displayName: 'Bulbasaur!',
        stats: [45, 49, 49, 65, 65, 45],
      });
    }
    if (i === 3) {
      return fixtureMon(4, {
        name: 'charmander',
        displayName: 'Charmander!',
        stats: [39, 52, 43, 60, 50, 65],
        isLegendary: true,
      });
    }
    return fixtureMon(i + 1);
  }),
};
let isSnapshotDown = false;

fetchMock.mockImplementation(async (url: string) => {
  if (url.includes('dex-index')) {
    if (isSnapshotDown) throw new Error('snapshot down');
    return snapshotFixture;
  }
  if (url.includes('/type/')) {
    const name = url.split('/type/')[1] ?? '';
    // fire: charmander in slot 1; poison: bulbasaur in slot 2 (grass is its primary)
    const members: Record<string, unknown[]> = {
      fire: [
        {
          slot: 1,
          pokemon: {
            name: 'charmander',
            url: 'https://pokeapi.co/api/v2/pokemon/4/',
          },
        },
      ],
      poison: [
        {
          slot: 2,
          pokemon: {
            name: 'bulbasaur',
            url: 'https://pokeapi.co/api/v2/pokemon/1/',
          },
        },
      ],
    };
    return { name, pokemon: members[name] ?? [] };
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

afterEach(() => {
  isSnapshotDown = false;
  useNuxtApp()
    .vueApp.runWithContext(() => useQueryClient())
    .clear();
});

const listedHrefs = (wrapper: {
  findAll: (
    selector: string
  ) => { attributes: (name: string) => string | undefined }[];
}): (string | undefined)[] =>
  wrapper
    .findAll('a[href^="/pokemon/"]')
    .map((link) => link.attributes('href'));

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

  it('includes a slot-2 member when filtering by its type', async () => {
    const wrapper = await mountSuspended(IndexPage);
    await vi.waitFor(() => {
      expect(wrapper.findAll('a[href^="/pokemon/"]')).toHaveLength(2);
    });
    const chips = wrapper.findAll('button[aria-pressed]');
    await chips.find((chip) => chip.text() === 'poison')?.trigger('click');
    await vi.waitFor(() => {
      expect(listedHrefs(wrapper)).toEqual(['/pokemon/bulbasaur']);
    });
  });

  it('restores type and search from the URL after mount', async () => {
    const wrapper = await mountSuspended(IndexPage, {
      route: '/?type=fire&q=char',
    });
    await vi.waitFor(() => {
      expect(
        wrapper
          .findAll('button[aria-pressed]')
          .find((chip) => chip.text() === 'fire')
          ?.attributes('aria-pressed')
      ).toBe('true');
    });
    expect(
      (wrapper.find('input[type="search"]').element as HTMLInputElement).value
    ).toBe('char');
    await vi.waitFor(() => {
      expect(listedHrefs(wrapper)).toEqual(['/pokemon/charmander']);
    });
  });

  it('writes a chip click to the URL with router.replace and keeps the hash', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/#index' });
    const router = useRouter();
    const replace = vi.spyOn(router, 'replace');
    await wrapper
      .findAll('button[aria-pressed]')
      .find((chip) => chip.text() === 'fire')
      ?.trigger('click');
    await vi.waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        expect.objectContaining({ query: { type: 'fire' }, hash: '#index' })
      );
    });
    await vi.waitFor(() => {
      expect(router.currentRoute.value.query).toEqual({ type: 'fire' });
    });
    expect(router.currentRoute.value.hash).toBe('#index');
    replace.mockRestore();
  });

  it('keeps a chip off when it is toggled off before the first URL write lands', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' });
    const router = useRouter();
    // Hold the "type=fire" navigation so the second toggle happens while it is in flight
    const gate: { open: () => void } = { open: () => undefined };
    const held = new Promise<undefined>((resolve) => {
      gate.open = (): void => resolve(undefined);
    });
    const removeGuard = router.beforeEach(async (to) => {
      if (to.query.type === 'fire') await held;
    });
    const fireChip = (): ReturnType<typeof wrapper.find> =>
      wrapper
        .findAll('button[aria-pressed]')
        .find((chip) => chip.text() === 'fire')!;

    await fireChip().trigger('click');
    expect(fireChip().attributes('aria-pressed')).toBe('true');
    await fireChip().trigger('click');
    expect(fireChip().attributes('aria-pressed')).toBe('false');
    gate.open();

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fireChip().attributes('aria-pressed')).toBe('false');
    expect(router.currentRoute.value.query.type).toBeUndefined();
    removeGuard();
  });

  it('follows the URL when it changes after mount (back and forward)', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/' });
    const fireChip = (): string | undefined =>
      wrapper
        .findAll('button[aria-pressed]')
        .find((chip) => chip.text() === 'fire')
        ?.attributes('aria-pressed');
    expect(fireChip()).toBe('false');
    await useRouter().replace({ query: { type: 'fire' } });
    await vi.waitFor(() => {
      expect(fireChip()).toBe('true');
    });
  });

  it('shows snapshot display names on the cards once it loads', async () => {
    const wrapper = await mountSuspended(IndexPage);
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Bulbasaur!');
    });
    expect(wrapper.text()).toContain('Charmander!');
  });

  it('has labelled native selects for generation, rarity, sort and direction', async () => {
    const wrapper = await mountSuspended(IndexPage);
    const labels = wrapper
      .findAll('select')
      .map((select) =>
        wrapper.find(`label[for="${select.attributes('id')}"]`).text()
      );
    expect(labels).toEqual(['Generation', 'Rarity', 'Sort by', 'Direction']);
  });

  it('restores rarity from the URL and filters with the snapshot', async () => {
    const wrapper = await mountSuspended(IndexPage, {
      route: '/?rarity=legendary',
    });
    await vi.waitFor(() => {
      expect(listedHrefs(wrapper)).toEqual(['/pokemon/charmander']);
    });
    expect(
      (wrapper.findAll('select')[1]?.element as HTMLSelectElement).value
    ).toBe('legendary');
  });

  it('restores generation from the URL and shows the empty state', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/?gen=2' });
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('No Pokémon match');
    });
  });

  it('sorts by a stat from the URL, both directions', async () => {
    const wrapper = await mountSuspended(IndexPage, {
      route: '/?sort=speed&dir=desc',
    });
    await vi.waitFor(() => {
      expect(listedHrefs(wrapper)).toEqual([
        '/pokemon/charmander',
        '/pokemon/bulbasaur',
      ]);
    });
    await useRouter().replace({ query: { sort: 'speed', dir: 'asc' } });
    await vi.waitFor(() => {
      expect(listedHrefs(wrapper)).toEqual([
        '/pokemon/bulbasaur',
        '/pokemon/charmander',
      ]);
    });
  });

  it('writes a sort choice to the URL and Clear removes it', async () => {
    const wrapper = await mountSuspended(IndexPage, { route: '/#index' });
    const router = useRouter();
    await wrapper.findAll('select')[2]?.setValue('hp');
    await vi.waitFor(() => {
      expect(router.currentRoute.value.query).toEqual({ sort: 'hp' });
    });
    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Clear')
      ?.trigger('click');
    await vi.waitFor(() => {
      expect(router.currentRoute.value.query).toEqual({});
    });
    expect(router.currentRoute.value.hash).toBe('#index');
  });

  it('shows an error with Try again when the snapshot fails', async () => {
    isSnapshotDown = true;
    const client = useNuxtApp().vueApp.runWithContext(() => useQueryClient());
    client.setQueryDefaults(['pokemon', 'dex-index'], { retry: false });
    const wrapper = await mountSuspended(IndexPage, { route: '/?gen=1' });
    await vi.waitFor(() => {
      expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    });
    isSnapshotDown = false;
    await wrapper.find('[role="alert"] button').trigger('click');
    await vi.waitFor(() => {
      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    });
    expect(listedHrefs(wrapper)).toContain('/pokemon/bulbasaur');
  });
});
