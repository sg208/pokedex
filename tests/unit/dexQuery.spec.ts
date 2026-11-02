import { describe, expect, it } from 'vitest';
import {
  buildDexQuery,
  isSameDexState,
  parseDexQuery,
  type DexQueryState,
} from '~/utils/dexQuery';

const EMPTY: DexQueryState = {
  query: '',
  type: null,
  gen: null,
  rarity: null,
  sort: null,
  dir: 'desc',
};

describe('parseDexQuery', () => {
  it('reads q and a valid type', () => {
    expect(parseDexQuery({ q: 'char', type: 'fire' })).toMatchObject({
      query: 'char',
      type: 'fire',
    });
  });

  it('ignores an invalid type and takes the first of repeated keys', () => {
    expect(parseDexQuery({ q: ['a', 'b'], type: 'bogus' })).toMatchObject({
      query: 'a',
      type: null,
    });
    expect(parseDexQuery({ type: ['water', 'fire'] }).type).toBe('water');
  });

  it('returns defaults for an empty query', () => {
    expect(parseDexQuery({})).toEqual(EMPTY);
  });
});

describe('buildDexQuery', () => {
  it('round-trips q and type', () => {
    const built = buildDexQuery({}, { ...EMPTY, query: 'char', type: 'fire' });
    expect(built).toEqual({ q: 'char', type: 'fire' });
    expect(parseDexQuery(built)).toEqual({
      ...EMPTY,
      query: 'char',
      type: 'fire',
    });
  });

  it('omits defaults and blank queries', () => {
    expect(buildDexQuery({}, { ...EMPTY, query: '   ' })).toEqual({});
    expect(buildDexQuery({ q: 'old', type: 'fire' }, EMPTY)).toEqual({});
  });

  it('preserves unknown keys', () => {
    expect(
      buildDexQuery(
        { utm: 'x', tag: ['a', 'b'], q: 'old' },
        { ...EMPTY, query: 'new' }
      )
    ).toEqual({ utm: 'x', tag: ['a', 'b'], q: 'new' });
  });
});

describe('gen, rarity, sort and dir', () => {
  const full: DexQueryState = {
    query: '',
    type: null,
    gen: 3,
    rarity: 'mythical',
    sort: 'special-attack',
    dir: 'asc',
  };

  it('round-trips through build and parse', () => {
    const built = buildDexQuery({}, full);
    expect(built).toEqual({
      gen: '3',
      rarity: 'mythical',
      sort: 'special-attack',
      dir: 'asc',
    });
    expect(parseDexQuery(built)).toEqual(full);
  });

  it('omits the default direction and a direction without a sort', () => {
    expect(buildDexQuery({}, { ...EMPTY, sort: 'speed' })).toEqual({
      sort: 'speed',
    });
    expect(buildDexQuery({}, { ...EMPTY, dir: 'asc' })).toEqual({});
  });

  it('ignores invalid values', () => {
    expect(
      parseDexQuery({ gen: '0', rarity: 'rare', sort: 'x', dir: 'up' })
    ).toEqual(EMPTY);
    expect(parseDexQuery({ gen: '10' }).gen).toBeNull();
    expect(parseDexQuery({ gen: '2.5' }).gen).toBeNull();
    expect(parseDexQuery({ gen: '9' }).gen).toBe(9);
  });

  it('clears removed values and keeps unknown keys', () => {
    expect(
      buildDexQuery({ gen: '3', sort: 'hp', dir: 'asc', utm: 'x' }, EMPTY)
    ).toEqual({ utm: 'x' });
  });
});

describe('isSameDexState', () => {
  it('ignores padding around the search text and spots any other change', () => {
    expect(
      isSameDexState({ ...EMPTY, query: ' a ' }, { ...EMPTY, query: 'a' })
    ).toBe(true);
    expect(isSameDexState(EMPTY, { ...EMPTY, sort: 'hp' })).toBe(false);
    expect(isSameDexState(EMPTY, { ...EMPTY, dir: 'asc' })).toBe(false);
    expect(isSameDexState(EMPTY, { ...EMPTY, gen: 1 })).toBe(false);
  });
});
