import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect } from 'vitest';
import AccessibilityPage from '~/pages/accessibility.vue';
import PrivacyPage from '~/pages/privacy.vue';
import TermsPage from '~/pages/terms.vue';

const issuesUrl = 'https://github.com/sg208/pokedex/issues';

describe('Legal pages', () => {
  it.each([
    ['accessibility', AccessibilityPage, 'Accessibility'],
    ['privacy', PrivacyPage, 'Privacy'],
    ['terms', TermsPage, 'Terms'],
  ])(
    '%s page has one h1 and links to GitHub issues',
    async (_, page, title) => {
      const wrapper = await mountSuspended(page);
      const headings = wrapper.findAll('h1');
      expect(headings).toHaveLength(1);
      expect(headings[0]?.text()).toBe(title);
      expect(wrapper.find(`a[href="${issuesUrl}"]`).exists()).toBe(true);
    }
  );

  it('privacy page names the third parties and states no cookies or tracking', async () => {
    const text = (await mountSuspended(PrivacyPage)).text();
    expect(text).toContain('pokeapi.co');
    expect(text).toContain('raw.githubusercontent.com');
    expect(text).toContain('Cloudflare');
    expect(text).toContain('No cookies');
    expect(text).toContain('no tracking');
  });

  it('accessibility page states the WCAG target', async () => {
    expect((await mountSuspended(AccessibilityPage)).text()).toContain(
      'WCAG 2.2'
    );
  });

  it('terms page names the MIT licence and the trademark owners', async () => {
    const text = (await mountSuspended(TermsPage)).text();
    expect(text).toContain('MIT');
    expect(text).toContain('Nintendo');
    expect(text).toContain('GAME FREAK');
  });
});
