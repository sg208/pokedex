import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { useQueryClient } from '@tanstack/vue-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EvolutionTree from '~/components/EvolutionTree.vue';
import type { EvolutionNode } from '~/utils/evolution';

const { fetchMock, prefetchOn } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  prefetchOn: vi.fn(() => ({})),
}));
mockNuxtImport('$fetch', () => fetchMock);
vi.mock('~/composables/usePokemonPrefetch', () => ({
  usePokemonPrefetch: (): { prefetchOn: typeof prefetchOn } => ({
    prefetchOn,
  }),
}));

const DEFAULT_NAMES: Record<number, string> = {
  848: 'toxel',
  849: 'toxtricity-amped',
  52: 'meowth',
  863: 'perrserker',
};

// Index with the same id/name shape as the real snapshot: pokemon[id - 1]
const snapshot = {
  pokemon: Array.from({ length: 1025 }, (_, position) => ({
    id: position + 1,
    name: DEFAULT_NAMES[position + 1] ?? `mon-${position + 1}`,
    displayName: `Mon ${position + 1}`,
    types: ['normal'],
    abilities: [],
    bst: 100,
    stage: 0,
    isFinal: false,
  })),
  types: [],
  chart: [],
  forms: [],
  moves: {},
  versionGroups: [],
};

const node = (
  id: number,
  name: string,
  children: EvolutionNode[] = [],
  extra: Partial<EvolutionNode> = {}
): EvolutionNode => ({
  id,
  name,
  isBaby: false,
  details: [],
  children,
  ...extra,
});

const level = (min_level: number): EvolutionNode['details'] => [
  { trigger: { name: 'level-up', url: '' }, min_level },
];

const toxel = node(848, 'toxel', [
  node(849, 'toxtricity', [], { details: level(30) }),
]);

afterEach(() => {
  useNuxtApp()
    .vueApp.runWithContext(() => useQueryClient())
    .clear();
  fetchMock.mockReset();
  prefetchOn.mockClear();
});

describe('EvolutionTree', () => {
  it('links to the default variety name and prefetches it once the snapshot loads', async () => {
    fetchMock.mockResolvedValue(snapshot);
    const wrapper = await mountSuspended(EvolutionTree, {
      props: { tree: toxel, currentName: 'toxel' },
    });
    await vi.waitFor(() => {
      expect(wrapper.find('a[href="/pokemon/toxtricity-amped"]').exists()).toBe(
        true
      );
    });
    expect(prefetchOn).toHaveBeenCalledWith('toxtricity-amped');
    // the label comes from the snapshot display name
    expect(wrapper.text()).toContain('Mon 849');
  });

  it('falls back to the species name before the snapshot loads', async () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    const wrapper = await mountSuspended(EvolutionTree, {
      props: { tree: toxel, currentName: 'toxel' },
    });
    expect(wrapper.find('a[href="/pokemon/toxtricity"]').exists()).toBe(true);
    expect(prefetchOn).toHaveBeenCalledWith('toxtricity');
    expect(wrapper.text()).toContain('toxtricity');
  });

  it('nests lists, marks the current stage and reads the method as text', async () => {
    fetchMock.mockResolvedValue(snapshot);
    const wrapper = await mountSuspended(EvolutionTree, {
      props: { tree: toxel, currentName: 'toxel' },
    });
    expect(wrapper.findAll('ul')).toHaveLength(2);
    expect(
      wrapper.find('ul ul li a[href^="/pokemon/toxtricity"]').exists()
    ).toBe(true);
    const current = wrapper.findAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0]?.attributes('href')).toBe('/pokemon/toxel');
    const nested = wrapper.find('ul ul a');
    expect(nested.text()).toContain('Evolves by Lv 30');
    expect(nested.attributes('aria-current')).toBeUndefined();
  });

  it('notes a regional-only evolution on the evolved stage', async () => {
    fetchMock.mockResolvedValue(snapshot);
    const meowth = node(52, 'meowth', [
      node(53, 'persian', [], { details: level(28) }),
      node(863, 'perrserker', [], {
        details: level(28),
        regionNote: 'Galarian Meowth only',
      }),
    ]);
    const wrapper = await mountSuspended(EvolutionTree, {
      props: { tree: meowth, currentName: 'meowth' },
    });
    const links = wrapper.findAll('ul ul li > a');
    expect(links).toHaveLength(2);
    expect(links[0]?.text()).not.toContain('only');
    expect(links[1]?.text()).toContain('Galarian Meowth only');
  });

  it('renders eight Eevee branches as one flat nested list', async () => {
    fetchMock.mockResolvedValue(snapshot);
    const ids = [134, 135, 136, 196, 197, 470, 471, 700];
    const eevee = node(
      133,
      'eevee-with-a-very-long-name-here',
      ids.map((id) => node(id, `branch-${id}`, [], { details: level(10) }))
    );
    const wrapper = await mountSuspended(EvolutionTree, {
      props: { tree: eevee, currentName: 'eevee' },
    });
    expect(wrapper.findAll('ul ul > li')).toHaveLength(8);
    expect(wrapper.findAll('a')).toHaveLength(9);
  });

  it('says so when there is nothing to evolve into, with or without battle forms', async () => {
    fetchMock.mockResolvedValue(snapshot);
    const plain = await mountSuspended(EvolutionTree, {
      props: { tree: node(132, 'ditto'), currentName: 'ditto' },
    });
    expect(plain.text()).toBe('This Pokémon does not evolve.');
    expect(plain.find('ul').exists()).toBe(false);
    const forms = await mountSuspended(EvolutionTree, {
      props: { tree: null, currentName: 'x', hasBattleForms: true },
    });
    expect(forms.text()).toBe(
      'This Pokémon does not evolve, but it can change form in battle.'
    );
  });
});
