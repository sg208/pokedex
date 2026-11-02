// public/data/dex-index.json, written by scripts/build-dex-index.ts
export interface DexIndexPokemon {
  id: number;
  name: string;
  types: string[];
  bst: number;
  stage: number;
  isFinal: boolean;
  // Regular (non-hidden) abilities in slot order
  abilities: string[];
  // English species name, e.g. "Mr. Mime"
  displayName: string;
  generation: number;
  isLegendary: boolean;
  isMythical: boolean;
  // hp, attack, defense, special-attack, special-defense, speed
  stats: number[];
}

export interface DexIndexMove {
  type: string;
  power: number | null;
  damageClass: string;
}

export type BattleFormKind = 'mega' | 'primal' | 'gmax';

export interface DexIndexForm {
  id: number;
  name: string;
  speciesId: number;
  kind: BattleFormKind;
  types: string[];
  bst: number;
}

export interface DexIndex {
  types: string[];
  chart: number[][];
  pokemon: DexIndexPokemon[];
  forms: DexIndexForm[];
  moves: Record<string, DexIndexMove>;
  versionGroups: Record<string, number>;
}
