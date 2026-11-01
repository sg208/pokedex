import { describe, it, expect } from 'vitest';
import {
  DEX_MAX,
  artworkUrl,
  cleanFlavorText,
  formatDexNumber,
  formatHeight,
  formatName,
  formatWeight,
  nameFitLength,
  parseIdFromUrl,
  pickGenus,
  pickFlavorText,
  statLabel,
  statPercent,
} from '~/utils/pokemon';

describe('pokemon helpers', () => {
  it('reads the id from a PokeAPI url', () => {
    expect(parseIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
    expect(parseIdFromUrl('https://pokeapi.co/api/v2/evolution-chain/10')).toBe(
      10
    );
  });

  it('throws on a url without an id', () => {
    expect(() =>
      parseIdFromUrl('https://pokeapi.co/api/v2/pokemon/')
    ).toThrow();
  });

  it('formats dex numbers with four digits', () => {
    expect(formatDexNumber(25)).toBe('#0025');
    expect(formatDexNumber(1025)).toBe('#1025');
  });

  it('formats height (decimetres) and weight (hectograms)', () => {
    expect(formatHeight(4)).toBe('0.4 m');
    expect(formatWeight(60)).toBe('6.0 kg');
    expect(formatWeight(1000)).toBe('100.0 kg');
  });

  it('labels stats', () => {
    expect(statLabel('special-attack')).toBe('Sp. Atk');
    expect(statLabel('special-defense')).toBe('Sp. Def');
    expect(statLabel('hp')).toBe('HP');
    expect(statLabel('speed')).toBe('Speed');
  });

  it('formats names by replacing hyphens', () => {
    expect(formatName('mr-mime')).toBe('mr mime');
    expect(formatName('pikachu')).toBe('pikachu');
  });

  it('builds the official artwork url', () => {
    expect(artworkUrl(25)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
    );
  });

  it('caps the dex at 1025', () => {
    expect(DEX_MAX).toBe(1025);
  });

  it('clamps stat bars between 0 and 1 of 255', () => {
    expect(statPercent(255)).toBe(100);
    expect(statPercent(0)).toBe(0);
    expect(statPercent(300)).toBe(100);
    expect(statPercent(51)).toBe(20);
  });

  it('collapses form feeds and whitespace in flavor text', () => {
    expect(cleanFlavorText('When several\fof these\n POKéMON gather')).toBe(
      'When several of these POKéMON gather'
    );
  });

  it('picks English flavor text and genus', () => {
    const flavors = [
      { flavor_text: 'ほげ', language: { name: 'ja' } },
      { flavor_text: 'Electric\fmouse.', language: { name: 'en' } },
    ];
    const genera = [
      { genus: 'ねずみ', language: { name: 'ja' } },
      { genus: 'Mouse Pokémon', language: { name: 'en' } },
    ];
    expect(pickFlavorText(flavors)).toBe('Electric mouse.');
    expect(pickGenus(genera)).toBe('Mouse Pokémon');
    expect(pickFlavorText([])).toBe('');
    expect(pickGenus([])).toBe('');
  });
});

describe('nameFitLength', () => {
  it('sizes by the longest word or half the letters, whichever is larger', () => {
    expect(nameFitLength('pikachu')).toBe(7);
    expect(nameFitLength('iron-valiant')).toBe(7);
    expect(nameFitLength('great-tusk')).toBe(5);
    expect(nameFitLength('oricorio-pom-pom')).toBe(8);
    expect(nameFitLength('crabominable')).toBe(12);
  });
});
