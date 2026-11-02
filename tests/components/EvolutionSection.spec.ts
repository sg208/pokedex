import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it, vi } from 'vitest';
import EvolutionSection from '~/components/EvolutionSection.vue';

const { fetchMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(() => new Promise(() => undefined)),
}));
mockNuxtImport('$fetch', () => fetchMock);

describe('EvolutionSection', () => {
  it('says it is loading, not "does not evolve", before the chain arrives', async () => {
    const wrapper = await mountSuspended(EvolutionSection, {
      props: { currentName: 'pikachu', battleForms: [] },
    });
    expect(wrapper.text()).not.toContain('does not evolve');
    expect(wrapper.text()).toContain('Loading evolutions');
  });

  it('says the evolutions could not load when the chain request failed', async () => {
    const wrapper = await mountSuspended(EvolutionSection, {
      props: { currentName: 'pikachu', battleForms: [], isError: true },
    });
    expect(wrapper.text()).not.toContain('does not evolve');
    expect(wrapper.text()).toContain('Evolutions could not be loaded');
  });

  it('still says "does not evolve" for a single-stage chain', async () => {
    const wrapper = await mountSuspended(EvolutionSection, {
      props: {
        currentName: 'tauros',
        battleForms: [],
        chain: {
          species: {
            name: 'tauros',
            url: 'https://pokeapi.co/api/v2/pokemon-species/128/',
          },
          evolves_to: [],
        },
      },
    });
    expect(wrapper.text()).toContain('This Pokémon does not evolve.');
  });
});
