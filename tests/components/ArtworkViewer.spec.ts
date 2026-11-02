import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import ArtworkViewer from '~/components/ArtworkViewer.vue';

const props = {
  name: 'pikachu',
  defaultSrc: 'https://x/default.png',
  shinySrc: 'https://x/shiny/25.png',
  fallbackSrc: 'https://x/fallback.png',
};

describe('ArtworkViewer', () => {
  it('toggles shiny with aria-pressed, swapping src and alt', async () => {
    const wrapper = await mountSuspended(ArtworkViewer, { props });
    const button = wrapper.find('button');
    expect(button.attributes('aria-pressed')).toBe('false');
    expect(wrapper.find('img').attributes('src')).toBe(props.defaultSrc);
    expect(wrapper.find('img').attributes('alt')).toBe('pikachu');

    await button.trigger('click');
    expect(button.attributes('aria-pressed')).toBe('true');
    expect(wrapper.find('img').attributes('src')).toContain('/shiny/');
    expect(wrapper.find('img').attributes('alt')).toBe('pikachu, shiny');
  });

  it('hides the toggle when the shiny is the default artwork', async () => {
    const wrapper = await mountSuspended(ArtworkViewer, {
      props: { ...props, shinySrc: props.defaultSrc },
    });
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('falls back to the default, then the known artwork, on a load failure', async () => {
    const wrapper = await mountSuspended(ArtworkViewer, { props });
    await wrapper.find('button').trigger('click');
    await wrapper.find('img').trigger('error');
    expect(wrapper.find('img').attributes('src')).toBe(props.defaultSrc);
    await wrapper.find('img').trigger('error');
    expect(wrapper.find('img').attributes('src')).toBe(props.fallbackSrc);
  });
});
