import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect } from 'vitest';
import AppFooter from '~/components/AppFooter.vue';

describe('AppFooter', () => {
  it('links to the three legal pages', async () => {
    const wrapper = await mountSuspended(AppFooter);
    expect(wrapper.find('a[href="/accessibility"]').exists()).toBe(true);
    expect(wrapper.find('a[href="/privacy"]').exists()).toBe(true);
    expect(wrapper.find('a[href="/terms"]').exists()).toBe(true);
  });

  it('has exactly one GitHub link: a source icon for this repo', async () => {
    const wrapper = await mountSuspended(AppFooter);
    const githubLinks = wrapper
      .findAll('a')
      .filter((link) => link.attributes('href')?.includes('github.com'));
    expect(githubLinks).toHaveLength(1);
    const [link] = githubLinks;
    expect(link?.attributes('href')).toBe('https://github.com/sg208/pokedex');
    expect(link?.attributes('aria-label')).toBe(
      'Source code on GitHub (opens in a new tab)'
    );
    expect(link?.attributes('target')).toBe('_blank');
    expect(link?.attributes('rel')).toContain('noopener');
    expect(link?.attributes('rel')).toContain('noreferrer');
    expect(link?.text()).toBe('');
    const icon = link?.find('svg');
    expect(icon?.attributes('aria-hidden')).toBe('true');
    expect(icon?.attributes('focusable')).toBe('false');
  });

  it('credits the author and shows the year', async () => {
    const wrapper = await mountSuspended(AppFooter);
    expect(wrapper.text()).toContain(`© ${new Date().getFullYear()}`);
    expect(wrapper.text()).toContain('MIT licence. Made by Syailendra Ginting');
  });

  it('carries the trademark disclaimer', async () => {
    const text = (await mountSuspended(AppFooter)).text();
    expect(text).toContain('Nintendo');
    expect(text).toContain('Creatures Inc.');
    expect(text).toContain('GAME FREAK');
    expect(text).toContain('PokeAPI');
    expect(text).toContain('Not affiliated');
  });
});
