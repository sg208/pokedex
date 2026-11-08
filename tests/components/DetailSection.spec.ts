import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import DetailSection from '~/components/DetailSection.vue';

const grounds = [
  ['ground', '#e6e0d2', '#1a1a1a', 'page-frame'],
  ['surface', '#dcd5c5', '#1a1a1a', 'bg-surface'],
  ['coral', '#ed4b44', '#1a1a1a', 'bg-coral'],
  ['yellow', '#f2c21a', '#1a1a1a', 'bg-yellow'],
  ['black', '#1a1a1a', '#e6e0d2', 'bg-field-black'],
] as const;

describe('DetailSection', () => {
  it.each(grounds)(
    'frames a %s chapter with its ground and ink',
    async (tone, bg, ink, toneClass) => {
      const wrapper = await mountSuspended(DetailSection, {
        props: { title: 'Size', tone },
        slots: { default: '<p class="body">Body</p>' },
      });
      const section = wrapper.find('section[data-chapter]');
      expect(section.attributes('data-bg')).toBe(bg);
      expect(section.attributes('data-ink')).toBe(ink);
      expect(section.classes()).toEqual(
        expect.arrayContaining(['page-frame', 'py-24', 'md:py-32', toneClass])
      );
      expect(wrapper.findAll('h2')).toHaveLength(1);
      expect(wrapper.find('h2').text()).toBe('Size');
    }
  );

  it('renders the slot after the heading', async () => {
    const wrapper = await mountSuspended(DetailSection, {
      props: { title: 'Size', tone: 'ground' },
      slots: { default: '<p class="body">Body</p>' },
    });
    const children = wrapper.find('section').element.children;
    expect(children[0]?.tagName).toBe('H2');
    expect(children[1]?.className).toBe('body');
  });
});
