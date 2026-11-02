import { isPokemonSlug } from '~/utils/pokemonSlug';

// National Pokédex ceiling: forms and later ids are out of scope
export const DEX_MAX = 1025;

const ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

export const parseIdFromUrl = (url: string): number => {
  const match = /\/(\d+)\/?$/.exec(url);
  if (!match?.[1]) throw new Error(`No id in url: ${url}`);
  return Number(match[1]);
};

export const formatDexNumber = (id: number): string =>
  `#${String(id).padStart(4, '0')}`;

export const formatHeight = (decimetres: number): string =>
  `${(decimetres / 10).toFixed(1)} m`;

export const formatWeight = (hectograms: number): string =>
  `${(hectograms / 10).toFixed(1)} kg`;

export const statLabel = (name: string): string =>
  STAT_LABELS[name] ?? formatName(name);

export const formatName = (name: string): string => name.replaceAll('-', ' ');

export const artworkUrl = (id: number): string => `${ARTWORK_BASE}/${id}.png`;

// Width of a stat bar as a percentage of the 255 ceiling
export const statPercent = (baseStat: number): number =>
  Math.round(Math.min(Math.max(baseStat / 255, 0), 1) * 100);

export const cleanFlavorText = (text: string): string =>
  text
    .replace(/\u00AD\s*/g, '')
    .replace(/[\f\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

interface FlavorEntry {
  flavor_text: string;
  language: { name: string };
}

interface GenusEntry {
  genus: string;
  language: { name: string };
}

export const pickFlavorText = (entries: FlavorEntry[]): string => {
  const entry = entries.find((item) => item.language.name === 'en');
  return entry ? cleanFlavorText(entry.flavor_text) : '';
};

export const pickGenus = (entries: GenusEntry[]): string =>
  entries.find((item) => item.language.name === 'en')?.genus ?? '';

// Detail shells are prerendered per name; refuse anything that is not a slug
export const buildDetailRoutes = (names: string[]): string[] => {
  if (!Array.isArray(names) || names.length === 0) {
    throw new Error('Expected a non-empty list of Pokémon names');
  }
  return names.map((name) => {
    if (!isPokemonSlug(name)) {
      throw new Error(`Malformed Pokémon name: ${String(name)}`);
    }
    return `/pokemon/${name}`;
  });
};

export interface DexNameEntry {
  name: string;
  id: number;
}

// Pulls the 1025 names and ids out of a /pokemon?limit=1025 response
export const extractDexEntries = (response: unknown): DexNameEntry[] => {
  const results = (response as { results?: { name: string; url: string }[] })
    ?.results;
  if (!Array.isArray(results) || results.length !== DEX_MAX) {
    throw new Error(`Expected ${DEX_MAX} Pokémon in the names response`);
  }
  const last = results[results.length - 1];
  if (!last || parseIdFromUrl(last.url) !== DEX_MAX) {
    throw new Error(`Expected the last Pokémon to have id ${DEX_MAX}`);
  }
  return results.map((entry): DexNameEntry => ({
    name: entry.name,
    id: parseIdFromUrl(entry.url),
  }));
};

export const DEX_SITE_URL = 'https://pokedex.engg.app';

const toTitleCase = (name: string): string =>
  formatName(name)
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export type HeadMeta =
  { name: string; content: string } | { property: string; content: string };

export interface DetailHead {
  title: string;
  meta: HeadMeta[];
}

// Per-Pokémon head: only the name and dex number are known without extra API calls
export const buildDetailHead = (name: string, id: number): DetailHead => {
  const display = toTitleCase(name);
  const title = `${display} ${formatDexNumber(id)} - Pokédex`;
  const description = `${display}, Pokédex ${formatDexNumber(id)}.`;
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: artworkUrl(id) },
      { property: 'og:url', content: `${DEX_SITE_URL}/pokemon/${name}` },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Pokédex' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  };
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

// Writes the head into a prerendered shell: swaps the <title>, adds the meta tags
export const injectHeadTags = (html: string, head: DetailHead): string => {
  if (!html.includes('</head>')) throw new Error('No </head> in the HTML');
  const tags = head.meta
    .map((tag) => {
      const key =
        'property' in tag
          ? `property="${escapeHtml(tag.property)}"`
          : `name="${escapeHtml(tag.name)}"`;
      return `<meta ${key} content="${escapeHtml(tag.content)}">`;
    })
    .join('');
  const title = `<title>${escapeHtml(head.title)}</title>`;
  const withTitle = /<title>[\s\S]*?<\/title>/.test(html)
    ? html.replace(/<title>[\s\S]*?<\/title>/, () => title)
    : html.replace('</head>', () => `${title}</head>`);
  return withTitle.replace('</head>', () => `${tags}</head>`);
};

// Letters that must fit on one line when the name is set in two lines at most
export const nameFitLength = (name: string): number => {
  const words = formatName(name).split(' ');
  const longest = Math.max(...words.map((word) => word.length));
  const letters = words.join('').length;
  return Math.max(longest, Math.ceil(letters / 2));
};

// ofetch errors carry the HTTP status as statusCode (and status on newer builds)
export const getErrorStatus = (error: unknown): number | undefined => {
  const { statusCode, status } = (error ?? {}) as {
    statusCode?: number;
    status?: number;
  };
  return statusCode ?? status;
};
