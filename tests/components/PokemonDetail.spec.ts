import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { useQueryClient } from '@tanstack/vue-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DetailPage from '~/pages/pokemon/[name].vue';

const { fetchMock, showErrorMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  showErrorMock: vi.fn(),
}));
mockNuxtImport('$fetch', () => fetchMock);
mockNuxtImport('showError', () => showErrorMock);

const API = 'https://pokeapi.co/api/v2';
const named = (name: string, id: number, kind = 'pokemon-species') => ({
  name,
  url: `${API}/${kind}/${id}/`,
});

const responses: Record<string, unknown> = {
  [`${API}/pokemon/pikachu`]: {
    id: 25,
    name: 'pikachu',
    height: 4,
    weight: 60,
    base_experience: 112,
    types: [{ slot: 1, type: { name: 'electric', url: '' } }],
    abilities: [
      { ability: { name: 'static', url: '' }, is_hidden: false },
      { ability: { name: 'lightning-rod', url: '' }, is_hidden: true },
    ],
    stats: [
      { base_stat: 35, stat: { name: 'hp', url: '' } },
      { base_stat: 255, stat: { name: 'speed', url: '' } },
      { base_stat: 300, stat: { name: 'attack', url: '' } },
    ],
  },
  [`${API}/pokemon-species/25`]: {
    id: 25,
    name: 'pikachu',
    flavor_text_entries: [
      { flavor_text: 'ほげ', language: { name: 'ja', url: '' } },
      {
        flavor_text:
          'When several of\fthese POKéMON\ngather, electricity builds.',
        language: { name: 'en', url: '' },
      },
    ],
    genera: [
      { genus: 'ねずみ', language: { name: 'ja', url: '' } },
      { genus: 'Mouse Pokémon', language: { name: 'en', url: '' } },
    ],
    evolution_chain: { url: `${API}/evolution-chain/10/` },
  },
  [`${API}/evolution-chain/10`]: {
    id: 10,
    chain: {
      species: named('pichu', 172),
      evolves_to: [
        {
          species: named('pikachu', 25),
          evolves_to: [{ species: named('raichu', 26), evolves_to: [] }],
        },
      ],
    },
  },
};

const dexNames = Array.from({ length: 1025 }, (_, index) =>
  index === 24 ? 'pikachu' : `mon-${index + 1}`
);

const mountDetail = () =>
  mountSuspended(DetailPage, { route: '/pokemon/pikachu' });

afterEach(() => {
  // The app's query client lives for the whole file; drop cached Pokémon between tests
  useNuxtApp()
    .vueApp.runWithContext(() => useQueryClient())
    .clear();
  fetchMock.mockReset();
  showErrorMock.mockReset();
});

describe('pokemon detail page', () => {
  const useHappyPath = (): void => {
    fetchMock.mockImplementation(async (url: string) => {
      const response = responses[url];
      if (!response)
        throw Object.assign(new Error('missing'), { statusCode: 404 });
      return response;
    });
  };

  it('shows the name as the only h1, with the dex number', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    await vi.waitFor(() => expect(wrapper.find('h1').text()).toBe('pikachu'));
    expect(wrapper.findAll('h1')).toHaveLength(1);
    expect(wrapper.text()).toContain('#0025');
  });

  it('draws stat bars at base_stat / 255, clamped, with the number as text', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    await vi.waitFor(() =>
      expect(wrapper.find('[data-stat="hp"]').exists()).toBe(true)
    );
    expect(
      wrapper.find('[data-stat="hp"] .stat-fill').attributes('style')
    ).toContain('width: 14%');
    expect(wrapper.find('[data-stat="hp"]').text()).toContain('35');
    expect(
      wrapper.find('[data-stat="speed"] .stat-fill').attributes('style')
    ).toContain('width: 100%');
    expect(
      wrapper.find('[data-stat="attack"] .stat-fill').attributes('style')
    ).toContain('width: 100%');
  });

  it('shows English flavor text with whitespace collapsed, and the English genus', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    await vi.waitFor(() => expect(wrapper.text()).toContain('Mouse Pokémon'));
    expect(wrapper.text()).toContain(
      'When several of these POKéMON gather, electricity builds.'
    );
    expect(wrapper.text()).not.toContain('ほげ');
  });

  it('shows facts with formatted height, weight and base experience', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    await vi.waitFor(() => expect(wrapper.text()).toContain('0.4 m'));
    expect(wrapper.text()).toContain('6.0 kg');
    expect(wrapper.text()).toContain('112');
  });

  it('links each evolution stage to its detail page', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    await vi.waitFor(() =>
      expect(wrapper.find('a[href="/pokemon/raichu"]').exists()).toBe(true)
    );
    expect(wrapper.find('a[href="/pokemon/pichu"]').exists()).toBe(true);
  });

  it('derives previous and next links from the names list', async () => {
    useHappyPath();
    fetchMock.mockImplementation(async (url: string) => {
      if (url === `${API}/pokemon`) {
        return {
          count: 1025,
          next: null,
          previous: null,
          results: dexNames.map((name, index) => ({
            name,
            url: `${API}/pokemon/${index + 1}/`,
          })),
        };
      }
      const response = responses[url];
      if (!response)
        throw Object.assign(new Error('missing'), { statusCode: 404 });
      return response;
    });
    const wrapper = await mountDetail();
    await vi.waitFor(() =>
      expect(
        wrapper.find('nav[aria-label="Neighbouring Pokémon"]').exists()
      ).toBe(true)
    );
    expect(wrapper.find('a[href="/pokemon/mon-24"]').text()).toContain('#0024');
    expect(wrapper.find('a[href="/pokemon/mon-26"]').text()).toContain('#0026');
  });

  it('raises a 404 for an unknown Pokémon', async () => {
    fetchMock.mockRejectedValue(
      Object.assign(new Error('Not Found'), { statusCode: 404 })
    );
    await mountDetail();
    await vi.waitFor(() => expect(showErrorMock).toHaveBeenCalled());
    expect(showErrorMock.mock.calls[0]?.[0]).toMatchObject({ statusCode: 404 });
  });

  it('offers a retry on other errors and does not raise a 404', async () => {
    fetchMock.mockRejectedValue(
      Object.assign(new Error('boom'), { statusCode: 500 })
    );
    const wrapper = await mountDetail();
    // WHY: non-404 errors retry twice with backoff (about 3s) before surfacing
    await vi.waitFor(
      () => expect(wrapper.find('[role="alert"] button').exists()).toBe(true),
      {
        timeout: 6000,
      }
    );
    expect(showErrorMock).not.toHaveBeenCalled();
  });
});
