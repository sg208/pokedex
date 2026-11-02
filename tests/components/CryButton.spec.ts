import { mountSuspended } from '@nuxt/test-utils/runtime';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CryButton from '~/components/CryButton.vue';

const play = vi.fn(async () => undefined);
const audioCtor = vi.fn();

// WHY: Audio is a browser boundary; happy-dom cannot play media
class FakeAudio {
  constructor(src: string) {
    audioCtor(src);
  }
  play = play;
}

// WHY: happy-dom reports no codec support; real browsers answer "maybe" for Ogg
const supportOgg = (answer: string): void => {
  vi.spyOn(HTMLMediaElement.prototype, 'canPlayType').mockReturnValue(
    answer as CanPlayTypeResult
  );
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  play.mockClear();
  audioCtor.mockClear();
});

describe('CryButton', () => {
  it('builds the Audio only on click, then plays it', async () => {
    vi.stubGlobal('Audio', FakeAudio);
    supportOgg('maybe');
    const wrapper = await mountSuspended(CryButton, {
      props: { src: 'https://x/25.ogg', name: 'pikachu' },
    });
    await vi.waitFor(() => expect(wrapper.find('button').exists()).toBe(true));
    expect(audioCtor).not.toHaveBeenCalled();
    expect(wrapper.find('audio').exists()).toBe(false);
    expect(wrapper.find('button').attributes('aria-label')).toBe(
      'Cry of pikachu'
    );

    await wrapper.find('button').trigger('click');
    expect(audioCtor).toHaveBeenCalledWith('https://x/25.ogg');
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('renders nothing without a cry URL', async () => {
    vi.stubGlobal('Audio', FakeAudio);
    supportOgg('maybe');
    const wrapper = await mountSuspended(CryButton, {
      props: { src: null, name: 'pikachu' },
    });
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('renders nothing when the browser cannot play Ogg', async () => {
    vi.stubGlobal('Audio', FakeAudio);
    supportOgg('');
    const wrapper = await mountSuspended(CryButton, {
      props: { src: 'https://x/25.ogg', name: 'pikachu' },
    });
    expect(wrapper.find('button').exists()).toBe(false);
  });
});
