import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import DexControls from '~/components/DexControls.vue';

const mountControls = (
  props = {}
): ReturnType<typeof mountSuspended<typeof DexControls>> =>
  mountSuspended(DexControls, {
    props: { gen: null, rarity: null, sort: null, dir: 'desc', ...props },
  });

describe('DexControls', () => {
  it('labels four native selects', async () => {
    const wrapper = await mountControls();
    const selects = wrapper.findAll('select');
    expect(selects).toHaveLength(4);
    const labels = selects.map((select) =>
      wrapper.find(`label[for="${select.attributes('id')}"]`).text()
    );
    expect(labels).toEqual(['Generation', 'Rarity', 'Sort by', 'Direction']);
  });

  it('offers nine generations, two rarities and seven sort keys', async () => {
    const wrapper = await mountControls();
    const optionCount = (index: number): number =>
      wrapper.findAll('select')[index]?.findAll('option').length ?? 0;
    expect(optionCount(0)).toBe(10);
    expect(optionCount(1)).toBe(3);
    expect(optionCount(2)).toBe(8);
  });

  it('emits typed values from each select', async () => {
    const wrapper = await mountControls();
    const [gen, rarity, sort, dir] = wrapper.findAll('select');
    await gen?.setValue('3');
    await rarity?.setValue('mythical');
    await sort?.setValue('special-attack');
    await dir?.setValue('asc');
    expect(wrapper.emitted('update:gen')).toEqual([[3]]);
    expect(wrapper.emitted('update:rarity')).toEqual([['mythical']]);
    expect(wrapper.emitted('update:sort')).toEqual([['special-attack']]);
    expect(wrapper.emitted('update:dir')).toEqual([['asc']]);
    await gen?.setValue('');
    expect(wrapper.emitted('update:gen')?.[1]).toEqual([null]);
  });

  it('shows Clear only while something is set, and emits clear', async () => {
    const idle = await mountControls();
    expect(idle.findAll('button')).toHaveLength(0);
    const active = await mountControls({ gen: 2 });
    const clear = active.find('button');
    expect(clear.text()).toBe('Clear');
    expect(clear.attributes('type')).toBe('button');
    await clear.trigger('click');
    expect(active.emitted('clear')).toHaveLength(1);
  });
});
