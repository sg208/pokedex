import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import WeaknessGrid from '~/components/WeaknessGrid.vue';
import dexIndex from '~/public/data/dex-index.json';

const bucketText = (
  wrapper: Awaited<ReturnType<typeof mountSuspended<typeof WeaknessGrid>>>
): Record<string, string[]> =>
  Object.fromEntries(
    wrapper
      .findAll('ul[aria-label] > li')
      .map((item) => [
        item.find('p').text().replace('damage taken from', '').trim(),
        item.findAll('ul li').map((chip) => chip.text()),
      ])
  );

describe('WeaknessGrid', () => {
  it('renders all five buckets, labelling the empty ones', async () => {
    const wrapper = await mountSuspended(WeaknessGrid, {
      props: { types: ['electric'], abilities: ['static'], index: dexIndex },
    });
    const buckets = bucketText(wrapper);
    expect(Object.keys(buckets)).toEqual(['×4', '×2', '×½', '×¼', '×0']);
    expect(buckets['×2']).toEqual(['ground']);
    expect(buckets['×4']).toEqual([]);
    const items = wrapper.findAll('ul[aria-label] > li');
    expect(items[0]?.text()).toContain('None');
    expect(items[0]?.text()).toContain('damage taken from');
    expect(items[1]?.text()).not.toContain('None');
  });

  it('shows Ground at ×0 for Rotom through Levitate', async () => {
    const wrapper = await mountSuspended(WeaknessGrid, {
      props: {
        types: ['electric', 'ghost'],
        abilities: ['levitate'],
        index: dexIndex,
      },
    });
    expect(bucketText(wrapper)['×0']).toContain('ground');
  });

  it('shows Shedinja at ×2 on five types and ×0 on thirteen', async () => {
    const wrapper = await mountSuspended(WeaknessGrid, {
      props: {
        types: ['bug', 'ghost'],
        abilities: ['wonder-guard'],
        index: dexIndex,
      },
    });
    const buckets = bucketText(wrapper);
    expect(buckets['×2']).toHaveLength(5);
    expect(buckets['×0']).toHaveLength(13);
  });
});
