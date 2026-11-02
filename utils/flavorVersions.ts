import type { NamedResource } from '~/types/pokemon';

interface FlavorEntry {
  flavor_text: string;
  language: NamedResource;
  version: NamedResource;
}

export interface FlavorVersion {
  version: string;
  text: string;
}

// The API writes the brand in capitals ("POKéMON"); body copy uses "Pokémon"
const restoreBrand = (text: string): string =>
  text.replaceAll('POKéMON', 'Pokémon').replaceAll('POKé', 'Poké');

// English entries, one per game, in the order the API lists them (oldest first)
export const listFlavorVersions = (entries: FlavorEntry[]): FlavorVersion[] =>
  entries
    .filter((entry) => entry.language.name === 'en')
    .map((entry) => ({
      version: entry.version.name,
      text: restoreBrand(cleanFlavorText(entry.flavor_text)),
    }))
    .filter((entry) => entry.text !== '');

export const defaultFlavorVersion = (versions: FlavorVersion[]): string =>
  versions.at(-1)?.version ?? '';
