import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DexFilters from '~/components/DexFilters.vue';

// WHY: real timing under test, the search is debounced by 250ms
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const mountFilters = (props = {}) =>
  mountSuspended(DexFilters, { props: { query: '', type: null, ...props } });

describe('DexFilters', () => {
  it('has a labelled search input', async () => {
    const wrapper = await mountFilters();
    const input = wrapper.find('input[type="search"]');
    const label = wrapper.find(`label[for="${input.attributes('id')}"]`);
    expect(label.text()).toBe('Search by name or number');
  });

  it('renders 18 type chips as native buttons with aria-pressed', async () => {
    const wrapper = await mountFilters({ type: 'fire' });
    const chips = wrapper.findAll('button[aria-pressed]');
    expect(chips).toHaveLength(18);
    chips.forEach((chip) => expect(chip.attributes('type')).toBe('button'));
    const fire = chips.find((chip) => chip.text() === 'fire');
    const water = chips.find((chip) => chip.text() === 'water');
    expect(fire?.attributes('aria-pressed')).toBe('true');
    expect(water?.attributes('aria-pressed')).toBe('false');
  });

  it('toggles a type on click and clears it on a second click', async () => {
    const wrapper = await mountFilters();
    const water = wrapper
      .findAll('button[aria-pressed]')
      .find((chip) => chip.text() === 'water');
    await water?.trigger('click');
    expect(wrapper.emitted('update:type')?.[0]).toEqual(['water']);

    await wrapper.setProps({ type: 'water' });
    await water?.trigger('click');
    expect(wrapper.emitted('update:type')?.[1]).toEqual([null]);
  });

  it('emits the search once after the debounce', async () => {
    const wrapper = await mountFilters();
    const input = wrapper.find('input[type="search"]');
    await input.setValue('p');
    await input.setValue('pi');
    await input.setValue('pika');
    expect(wrapper.emitted('update:query')).toBeUndefined();

    vi.advanceTimersByTime(250);
    expect(wrapper.emitted('update:query')).toEqual([['pika']]);
  });
});
