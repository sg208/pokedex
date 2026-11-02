import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { useQueryClient } from '@tanstack/vue-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DetailPage from '~/pages/pokemon/[name].vue';
import dexIndex from '~/public/data/dex-index.json';

const { fetchMock, showErrorMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  showErrorMock: vi.fn(),
}));
mockNuxtImport('$fetch', () => fetchMock);
mockNuxtImport('showError', () => showErrorMock);

const API = 'https://pokeapi.co/api/v2';
const named = (
  name: string,
  id: number,
  kind = 'pokemon-species'
): { name: string; url: string } => ({
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
      { base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } },
      { base_stat: 255, effort: 2, stat: { name: 'speed', url: '' } },
      { base_stat: 300, effort: 0, stat: { name: 'attack', url: '' } },
    ],
    sprites: {
      front_default: 'https://img.test/sprite/25.png',
      other: {
        'official-artwork': {
          front_default: 'https://img.test/artwork/25.png',
          front_shiny: 'https://img.test/artwork/shiny/25.png',
        },
      },
    },
    cries: { latest: 'https://img.test/cries/25.ogg', legacy: null },
    moves: [
      {
        move: { name: 'thunderbolt', url: '' },
        version_group_details: [
          {
            level_learned_at: 36,
            move_learn_method: { name: 'level-up', url: '' },
            version_group: { name: 'scarlet-violet', url: '' },
          },
        ],
      },
      {
        move: { name: 'thunder-shock', url: '' },
        version_group_details: [
          {
            level_learned_at: 1,
            move_learn_method: { name: 'level-up', url: '' },
            version_group: { name: 'scarlet-violet', url: '' },
          },
        ],
      },
    ],
  },
  '/data/dex-index.json': dexIndex,
  [`${API}/pokemon-species/25`]: {
    id: 25,
    name: 'pikachu',
    flavor_text_entries: [
      {
        flavor_text: 'ほげ',
        language: { name: 'ja', url: '' },
        version: { name: 'red', url: '' },
      },
      {
        flavor_text: 'Older entry.',
        language: { name: 'en', url: '' },
        version: { name: 'red', url: '' },
      },
      {
        flavor_text:
          'When several of\fthese POKéMON\ngather, electricity builds.',
        language: { name: 'en', url: '' },
        version: { name: 'sword', url: '' },
      },
    ],
    genera: [
      { genus: 'ねずみ', language: { name: 'ja', url: '' } },
      { genus: 'Mouse Pokémon', language: { name: 'en', url: '' } },
    ],
    evolution_chain: { url: `${API}/evolution-chain/10/` },
    is_baby: false,
    is_legendary: false,
    is_mythical: false,
    generation: { name: 'generation-i', url: '' },
    capture_rate: 190,
    gender_rate: 4,
    egg_groups: [
      { name: 'field', url: '' },
      { name: 'fairy', url: '' },
    ],
    hatch_counter: 10,
    base_happiness: 50,
    growth_rate: { name: 'medium', url: '' },
    has_gender_differences: true,
  },
  [`${API}/ability/static`]: {
    name: 'static',
    effect_entries: [
      {
        effect: 'long',
        short_effect: 'Contact may paralyze the attacker.',
        language: { name: 'en', url: '' },
      },
    ],
  },
  [`${API}/ability/lightning-rod`]: {
    name: 'lightning-rod',
    effect_entries: [
      {
        effect: 'long',
        short_effect: 'Draws in Electric moves.',
        language: { name: 'en', url: '' },
      },
    ],
  },
  [`${API}/evolution-chain/10`]: {
    id: 10,
    chain: {
      species: named('pichu', 172),
      evolution_details: [],
      evolves_to: [
        {
          species: named('pikachu', 25),
          evolution_details: [
            {
              trigger: { name: 'level-up', url: '' },
              min_happiness: 220,
            },
          ],
          evolves_to: [
            {
              species: named('raichu', 26),
              evolution_details: [
                {
                  trigger: { name: 'use-item', url: '' },
                  item: { name: 'thunder-stone', url: '' },
                },
              ],
              evolves_to: [],
            },
          ],
        },
      ],
    },
  },
};

const dexNames = Array.from({ length: 1025 }, (_, index) =>
  index === 24 ? 'pikachu' : `mon-${index + 1}`
);

const mountDetail = (): ReturnType<typeof mountSuspended<typeof DetailPage>> =>
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

  it('shows the display name as the only h1, with the dex number', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    await vi.waitFor(() => expect(wrapper.find('h1').text()).toBe('Pikachu'));
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
      'When several of these Pokémon gather, electricity builds.'
    );
    expect(wrapper.text()).not.toContain('ほげ');
  });

  it('lets the reader pick the game the flavor text is from', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    const select = await vi.waitFor(() => {
      const found = wrapper.find('select');
      expect(found.exists()).toBe(true);
      return found;
    });
    expect(wrapper.find(`label[for="${select.attributes('id')}"]`).text()).toBe(
      'Game'
    );
    await select.setValue('red');
    expect(wrapper.text()).toContain('Older entry.');
    expect(wrapper.text()).not.toContain('electricity builds');
  });

  it('shows the Pokédex data panel, and a shiny toggle that swaps the artwork', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    await vi.waitFor(() => expect(wrapper.text()).toContain('Catch rate'));
    const terms = wrapper.findAll('dt').map((term) => term.text());
    expect(terms).toEqual(
      expect.arrayContaining(['Generation', 'Gender ratio', 'EV yield'])
    );
    expect(wrapper.text()).toContain('2 Speed');
    expect(wrapper.text()).toContain('Generation I');
    expect(wrapper.text()).toContain('50% male, 50% female');

    const toggle = wrapper.find('button[aria-pressed]');
    expect(wrapper.find('img.detail-art').attributes('src')).toBe(
      'https://img.test/artwork/25.png'
    );
    await toggle.trigger('click');
    expect(toggle.attributes('aria-pressed')).toBe('true');
    expect(wrapper.find('img.detail-art').attributes('src')).toContain(
      '/shiny/'
    );
    expect(wrapper.find('audio').exists()).toBe(false);
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

  it('shows evolution methods and ability effects', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    await vi.waitFor(() => expect(wrapper.text()).toContain('Thunder Stone'));
    expect(wrapper.text()).toContain('Friendship');
    await vi.waitFor(() =>
      expect(wrapper.text()).toContain('Contact may paralyze the attacker.')
    );
    expect(wrapper.text()).toContain('Hidden ability');
  });

  it('shows the weakness grid with Ground at ×2 for Pikachu', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    await vi.waitFor(() =>
      expect(
        wrapper.find('ul[aria-label="Damage taken by attacking type"]').exists()
      ).toBe(true)
    );
    const buckets = wrapper.findAll(
      'ul[aria-label="Damage taken by attacking type"] > li'
    );
    expect(buckets).toHaveLength(5);
    expect(buckets[1]?.text()).toContain('×2');
    expect(buckets[1]?.text()).toContain('ground');
    expect(wrapper.text()).toContain(
      'Regular abilities that grant an immunity'
    );
  });

  it('lists level-up moves in level order with type and power', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    await vi.waitFor(() =>
      expect(wrapper.find('table caption').text()).toBe(
        'Moves learned by level'
      )
    );
    const rows = wrapper.findAll('tbody tr');
    expect(rows.map((row) => row.find('th .display').text())).toEqual([
      'thunder shock',
      'thunderbolt',
    ]);
    expect(rows[1]?.find('.move-class').text()).toBe('special');
    expect(rows[1]?.text()).toContain('36');
    expect(rows[1]?.text()).toContain('electric');
    expect(rows[1]?.find('.power-fill').attributes('style')).toContain(
      'width: 36%'
    );
    expect(wrapper.text()).toContain('As learned in scarlet violet.');
  });

  it('shows five nemeses and five easy opponents, ground types first', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    await vi.waitFor(() => expect(wrapper.text()).toContain('Arch nemeses'));
    const lists = wrapper.findAll('ol');
    expect(lists).toHaveLength(2);
    expect(lists[0]?.findAll('li')).toHaveLength(5);
    expect(lists[1]?.findAll('li')).toHaveLength(5);
    expect(lists[0]?.find('li').text()).toContain('ground');
    expect(lists[0]?.find('li').text()).toContain('hits ×0');
  });

  it('shows battle forms from the whole chain, apart from evolutions', async () => {
    useHappyPath();
    const wrapper = await mountDetail();
    await vi.waitFor(() => expect(wrapper.text()).toContain('Battle forms'));
    const forms = wrapper.findAll('.form');
    expect(forms).toHaveLength(1);
    expect(forms[0]?.text()).toContain('gigantamax pikachu');
    expect(forms[0]?.text()).toContain('Dynamax');
    expect(forms[0]?.find('img').attributes('src')).toMatch(/\/10199\.png$/);
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
