import { describe, expect, it } from 'vitest';
import {
  defaultArtworkUrl,
  pickCryUrl,
  shinyArtworkUrl,
} from '~/utils/detailMedia';
import { artworkUrl } from '~/utils/pokemon';

const sprites = {
  front_default: 'https://x/sprite.png',
  other: {
    'official-artwork': {
      front_default: 'https://x/default.png',
      front_shiny: 'https://x/shiny/25.png',
    },
  },
};

describe('detail media', () => {
  it('takes the shiny artwork from the official-artwork set', () => {
    expect(shinyArtworkUrl(sprites, 25)).toBe('https://x/shiny/25.png');
  });

  it('falls back to the default artwork when there is no shiny', () => {
    expect(shinyArtworkUrl({}, 25)).toBe(artworkUrl(25));
    expect(defaultArtworkUrl({}, 25)).toBe(artworkUrl(25));
    expect(defaultArtworkUrl(sprites, 25)).toBe('https://x/default.png');
  });

  it('picks the latest cry, then the legacy one, then null', () => {
    expect(pickCryUrl({ latest: 'a.ogg', legacy: 'b.ogg' })).toBe('a.ogg');
    expect(pickCryUrl({ latest: null, legacy: 'b.ogg' })).toBe('b.ogg');
    expect(pickCryUrl({})).toBeNull();
  });
});
