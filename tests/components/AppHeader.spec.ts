import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppHeader from '~/components/AppHeader.vue';

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let trigger: ObserverCallback = () => {};

// IntersectionObserver is a browser boundary: capture the callback to drive it
class FakeObserver {
  constructor(callback: ObserverCallback) {
    trigger = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = (): IntersectionObserverEntry[] => [];
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

describe('AppHeader', () => {
  it('has a home wordmark and no navigation landmark or Index link', async () => {
    const wrapper = await mountSuspended(AppHeader);
    expect(wrapper.find('a[href="/"]').text()).toContain('Pokédex');
    expect(wrapper.find('nav[aria-label="Main"]').exists()).toBe(false);
    expect(wrapper.find('a[href="/#index"]').exists()).toBe(false);
  });

  it('leaves the GitHub link to the footer', async () => {
    const wrapper = await mountSuspended(AppHeader);
    expect(wrapper.find('a[href*="github.com"]').exists()).toBe(false);
  });

  it('takes the ink and ground of the chapter under it', async () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const chapter = document.createElement('section');
    chapter.dataset.chapter = '';
    chapter.dataset.bg = '#1a1a1a';
    chapter.dataset.ink = '#e6e0d2';
    document.body.append(chapter);

    const wrapper = await mountSuspended(AppHeader);
    const header = wrapper.find('header');
    expect(header.attributes('style')).toContain('--header-ink: #1a1a1a');

    trigger([{ isIntersecting: true, target: chapter }]);
    await nextTick();

    expect(header.attributes('style')).toContain('--header-ink: #e6e0d2');
    expect(header.attributes('style')).toContain('--header-bg: #1a1a1a');
  });
});
