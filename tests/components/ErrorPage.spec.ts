import { mountSuspended } from '@nuxt/test-utils/runtime';
import { describe, it, expect } from 'vitest';
import ErrorPage from '~/error.vue';

const makeError = (statusCode: number): ReturnType<typeof createError> =>
  createError({ statusCode });

describe('error page', () => {
  it('says the page was not found for a 404 and links home', async () => {
    const wrapper = await mountSuspended(ErrorPage, {
      props: { error: makeError(404) },
    });
    expect(wrapper.findAll('h1')).toHaveLength(1);
    expect(wrapper.find('h1').text()).toBe('Page not found');
    expect(wrapper.find('main a[href="/"]').exists()).toBe(true);
  });

  it('uses a generic message for other errors', async () => {
    const wrapper = await mountSuspended(ErrorPage, {
      props: { error: makeError(500) },
    });
    expect(wrapper.find('h1').text()).toBe('Page error');
    expect(wrapper.text()).toContain('500');
  });
});
