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

  it('opens the source link safely in a new tab and says so', async () => {
    const wrapper = await mountSuspended(AppFooter);
    const link = wrapper.find('a[href="https://github.com/sg208/pokedex"]');
    expect(link.exists()).toBe(true);
    expect(link.text()).toContain('Source on GitHub');
    expect(link.attributes('target')).toBe('_blank');
    expect(link.attributes('rel')).toContain('noopener');
    expect(link.attributes('rel')).toContain('noreferrer');
    expect(link.find('.sr-only').text()).toBe('(opens GitHub in a new tab)');
  });

  it('shows the github.com/sg208 display link', async () => {
    const wrapper = await mountSuspended(AppFooter);
    const link = wrapper.find(
      'a[href="https://github.com/sg208"].footer-display'
    );
    expect(link.exists()).toBe(true);
    expect(link.text()).toBe('github.com/sg208');
  });

  it('credits the author and shows the year', async () => {
    const wrapper = await mountSuspended(AppFooter);
    expect(wrapper.text()).toContain(`© ${new Date().getFullYear()}`);
    expect(wrapper.text()).toContain('MIT licence. Made by Syailendra Ginting');
    const credit = wrapper.findAll('a[href="https://github.com/sg208"]');
    expect(credit.some((link) => link.text() === 'Syailendra Ginting')).toBe(
      true
    );
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
