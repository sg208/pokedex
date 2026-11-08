import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PokemonGrid from '~/components/PokemonGrid.vue';

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let trigger: Callback = () => {};

// IntersectionObserver is a browser boundary: capture the callback to drive it
class FakeObserver {
  constructor(callback: Callback) {
    trigger = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = (): IntersectionObserverEntry[] => [];
}

afterEach(() => vi.unstubAllGlobals());

const items = [
  { id: 1, name: 'bulbasaur' },
  { id: 4, name: 'charmander' },
];

const mountGrid = (
  props = {}
): ReturnType<typeof mountSuspended<typeof PokemonGrid>> =>
  mountSuspended(PokemonGrid, {
    props: {
      items,
      hasMore: true,
      isFetching: false,
      isError: false,
      typeIndex: new Map([[1, 'grass']]),
      ...props,
    },
  });

describe('PokemonGrid', () => {
  it('renders one card per item', async () => {
    const wrapper = await mountGrid();
    expect(wrapper.findAll('a[href^="/pokemon/"]')).toHaveLength(2);
  });

  it('shows display names from the map and the slug for the rest', async () => {
    const wrapper = await mountGrid({
      displayNames: new Map([[4, 'Charmander!']]),
    });
    expect(wrapper.text()).toContain('Charmander!');
    expect(wrapper.text()).toContain('bulbasaur');
  });

  it('shows a Load more button that emits loadMore', async () => {
    const wrapper = await mountGrid();
    const button = wrapper.find('button');
    expect(button.text()).toBe('Load more');
    await button.trigger('click');
    expect(wrapper.emitted('loadMore')).toHaveLength(1);
  });

  it('hides Load more when there is nothing more', async () => {
    const wrapper = await mountGrid({ hasMore: false });
    expect(wrapper.text()).not.toContain('Load more');
  });

  it('loads once when the sentinel intersects', async () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const wrapper = await mountGrid();
    trigger([{ isIntersecting: true }]);
    expect(wrapper.emitted('loadMore')).toHaveLength(1);
  });

  it('ignores a sentinel that is not intersecting or while fetching', async () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const wrapper = await mountGrid({ isFetching: true });
    trigger([{ isIntersecting: true }]);
    trigger([{ isIntersecting: false }]);
    expect(wrapper.emitted('loadMore')).toBeUndefined();
  });

  it('announces loading while the first page is fetching', async () => {
    const wrapper = await mountGrid({ items: [], isFetching: true });
    const busy = wrapper.find('[aria-busy="true"]');
    expect(busy.find('.sr-only').text()).toBe('Loading Pokémon…');
  });

  it('shows an empty state when nothing matches', async () => {
    const wrapper = await mountGrid({ items: [], hasMore: false });
    expect(wrapper.text()).toContain('No Pokémon match');
  });

  it('shows an error with a retry button', async () => {
    const wrapper = await mountGrid({ items: [], isError: true });
    const alert = wrapper.find('[role="alert"]');
    expect(alert.exists()).toBe(true);
    await alert.find('button').trigger('click');
    expect(wrapper.emitted('retry')).toHaveLength(1);
  });
});
