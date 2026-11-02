import { describe, expect, it } from 'vitest';
import {
  defaultFlavorVersion,
  listFlavorVersions,
} from '~/utils/flavorVersions';

const entry = (
  text: string,
  language: string,
  version: string
): {
  flavor_text: string;
  language: { name: string; url: string };
  version: { name: string; url: string };
} => ({
  flavor_text: text,
  language: { name: language, url: '' },
  version: { name: version, url: '' },
});

const entries = [
  entry('ほげ', 'ja', 'red'),
  entry('When several of\fthese POKéMON\ngather.', 'en', 'red'),
  entry('Stores electricity.', 'en', 'gold'),
  entry('POKéMON like the POKé BALL.', 'en', 'sword'),
];

describe('flavor versions', () => {
  it('lists English entries per version in API order', () => {
    expect(listFlavorVersions(entries).map((item) => item.version)).toEqual([
      'red',
      'gold',
      'sword',
    ]);
  });

  it('defaults to the latest version', () => {
    expect(defaultFlavorVersion(listFlavorVersions(entries))).toBe('sword');
    expect(defaultFlavorVersion([])).toBe('');
  });

  it('cleans whitespace and restores the accent in Pokémon and Poké', () => {
    const [red, , sword] = listFlavorVersions(entries);
    expect(red?.text).toBe('When several of these Pokémon gather.');
    expect(sword?.text).toBe('Pokémon like the Poké BALL.');
  });

  it('drops entries that are empty after cleaning', () => {
    expect(listFlavorVersions([entry(' \f ', 'en', 'red')])).toEqual([]);
  });
});
