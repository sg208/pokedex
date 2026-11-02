import { describe, it, expect } from 'vitest';
import {
  DEX_MAX,
  artworkUrl,
  buildDetailHead,
  injectHeadTags,
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

describe('buildDetailHead', () => {
  it('builds a title-cased title and the full meta set', () => {
    const head = buildDetailHead('mr-mime', 122);
    expect(head.title).toBe('Mr Mime #0122 - Pokédex');
    const byKey = Object.fromEntries(
      head.meta.map((tag) => [
        'property' in tag ? tag.property : tag.name,
        tag.content,
      ])
    );
    expect(byKey['description']).toBe('Mr Mime, Pokédex #0122.');
    expect(byKey['og:title']).toBe('Mr Mime #0122 - Pokédex');
    expect(byKey['og:description']).toBe('Mr Mime, Pokédex #0122.');
    expect(byKey['og:image']).toBe(artworkUrl(122));
    expect(byKey['og:url']).toBe('https://pokedex.engg.app/pokemon/mr-mime');
    expect(byKey['og:type']).toBe('website');
    expect(byKey['og:site_name']).toBe('Pokédex');
    expect(byKey['twitter:card']).toBe('summary_large_image');
  });
});

describe('injectHeadTags', () => {
  const head = buildDetailHead('pikachu', 25);
  const html =
    '<html><head><title>Pokédex</title><meta charset="utf-8"></head><body></body></html>';

  it('replaces the title and inserts meta before </head>', () => {
    const out = injectHeadTags(html, head);
    expect(out).toContain('<title>Pikachu #0025 - Pokédex</title>');
    expect(out.match(/<title>/g)).toHaveLength(1);
    expect(out).toContain(
      '<meta property="og:title" content="Pikachu #0025 - Pokédex">'
    );
    expect(out).toContain(
      '<meta name="twitter:card" content="summary_large_image">'
    );
    expect(out.indexOf('og:title')).toBeLessThan(out.indexOf('</head>'));
  });

  it('escapes & < > " in values', () => {
    const out = injectHeadTags(html, {
      title: 'A & <B>',
      meta: [{ name: 'description', content: 'say "hi"' }],
    });
    expect(out).toContain('<title>A &amp; &lt;B&gt;</title>');
    expect(out).toContain('content="say &quot;hi&quot;"');
  });

  it('throws when there is no </head>', () => {
    expect(() => injectHeadTags('<html></html>', head)).toThrow();
  });
});
