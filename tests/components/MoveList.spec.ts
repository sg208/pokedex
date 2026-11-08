import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, expect, it } from 'vitest';
import MoveList from '~/components/MoveList.vue';

const moves = [
  {
    name: 'tackle',
    level: 1,
    type: 'normal',
    power: 40,
    damageClass: 'physical',
  },
  {
    name: 'growl',
    level: 1,
    type: 'normal',
    power: null,
    damageClass: 'status',
  },
];

describe('MoveList', () => {
  it('reads a missing power as "No power" and a number as itself', async () => {
    const wrapper = await mountSuspended(MoveList, {
      props: { moves, versionGroup: 'red-blue' },
    });
    const [tackle, growl] = wrapper.findAll('td.move-power');
    expect(tackle?.text()).toBe('40');
    expect(tackle?.find('.sr-only').exists()).toBe(false);
    expect(growl?.find('.sr-only').text()).toBe('No power');
    expect(growl?.find('[aria-hidden="true"]').text()).toBe('—');
  });
});
