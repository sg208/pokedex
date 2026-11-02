import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect } from 'vitest';
import AppFooter from '~/components/AppFooter.vue';

const year = new Date().getFullYear();

describe('AppFooter', () => {
  it('links to the three legal pages', async () => {
    const wrapper = await mountSuspended(AppFooter);
    expect(wrapper.find('a[href="/accessibility"]').exists()).toBe(true);
    expect(wrapper.find('a[href="/privacy"]').exists()).toBe(true);
    expect(wrapper.find('a[href="/terms"]').exists()).toBe(true);
  });

  it('names PokeAPI once, as a new-tab link to pokeapi.co', async () => {
    const wrapper = await mountSuspended(AppFooter);
    expect(wrapper.text().match(/PokeAPI/g)).toHaveLength(1);
    const link = wrapper.find('a[href="https://pokeapi.co"]');
    expect(link.text()).toContain('Data and artwork from PokeAPI');
    expect(link.text()).toContain('(opens in a new tab)');
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toContain('noopener');
    expect(link.attributes('rel')).toContain('noreferrer');
  });

  it('links to the source with visible text and a new-tab hint', async () => {
    const wrapper = await mountSuspended(AppFooter);
    const githubLinks = wrapper
      .findAll('a')
      .filter((link) => link.attributes('href')?.includes('github.com'));
    expect(githubLinks).toHaveLength(1);
    const [link] = githubLinks;
    expect(link?.attributes('href')).toBe('https://github.com/sg208/pokedex');
    expect(link?.text()).toContain('Source on GitHub');
    expect(link?.find('.sr-only').text()).toBe('(opens in a new tab)');
    expect(link?.attributes('target')).toBe('_blank');
    expect(link?.attributes('rel')).toContain('noopener');
    expect(link?.attributes('rel')).toContain('noreferrer');
    expect(link?.find('svg').exists()).toBe(false);
  });

  it('keeps year, author and licence in one element', async () => {
    const wrapper = await mountSuspended(AppFooter);
    const credit = wrapper
      .findAll('p')
      .find((node) => node.text().includes(`© ${year} Syailendra Ginting`));
    expect(credit?.text()).toContain('MIT licence');
  });

  it('has one sr-only heading, one footer nav and a back-to-top link', async () => {
    const wrapper = await mountSuspended(AppFooter);
    expect(wrapper.findAll('h2.sr-only')).toHaveLength(1);
    expect(wrapper.findAll('nav[aria-label="Footer"]')).toHaveLength(1);
    expect(wrapper.find('a[href="#top"]').text()).toBe('Back to top');
  });

  it('keeps the chapter contract on the root', async () => {
    const root = (await mountSuspended(AppFooter)).find('footer');
    expect(root.attributes('data-chapter')).toBeDefined();
    expect(root.attributes('data-bg')).toBe('#ed4b44');
    expect(root.attributes('data-ink')).toBe('#1a1a1a');
  });

  it('carries the trademark disclaimer', async () => {
    const text = (await mountSuspended(AppFooter)).text();
    expect(text).toContain('Nintendo');
    expect(text).toContain('Creatures Inc.');
    expect(text).toContain('GAME FREAK');
    expect(text).toContain('Not affiliated');
  });
});
