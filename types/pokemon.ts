export interface NamedResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedResource[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: { slot: number; type: NamedResource }[];
  abilities: { ability: NamedResource; is_hidden: boolean }[];
  stats: { base_stat: number; stat: NamedResource }[];
  moves?: PokemonMove[];
}

export interface PokemonSpecies {
  id: number;
  name: string;
  flavor_text_entries: { flavor_text: string; language: NamedResource }[];
  genera: { genus: string; language: NamedResource }[];
  evolution_chain: { url: string };
}

export interface ChainLink {
  species: NamedResource;
  evolves_to: ChainLink[];
}

export interface EvolutionChainResponse {
  id: number;
  chain: ChainLink;
}

export interface TypeResponse {
  name: string;
  pokemon: { slot: number; pokemon: NamedResource }[];
}

export interface DexEntry {
  id: number;
  name: string;
}

export interface PageParam {
  offset: number;
  limit: number;
}

export interface EvolutionStage {
  id: number;
  name: string;
}

export interface PokemonMove {
  move: NamedResource;
  version_group_details: {
    level_learned_at: number;
    move_learn_method: NamedResource;
    version_group: NamedResource;
  }[];
}

// public/data/dex-index.json, written by scripts/build-dex-index.ts
export interface DexIndexPokemon {
  id: number;
  name: string;
  types: string[];
  bst: number;
  stage: number;
  isFinal: boolean;
}

export interface DexIndexMove {
  type: string;
  power: number | null;
  damageClass: string;
}

export interface DexIndex {
  types: string[];
  chart: number[][];
  pokemon: DexIndexPokemon[];
  moves: Record<string, DexIndexMove>;
  versionGroups: Record<string, number>;
}
