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
  stats: { base_stat: number; effort: number; stat: NamedResource }[];
  sprites: PokemonSprites;
  cries: PokemonCries;
  moves?: PokemonMove[];
}

export interface PokemonSprites {
  front_default?: string | null;
  other?: {
    'official-artwork'?: {
      front_default?: string | null;
      front_shiny?: string | null;
    };
  };
}

export interface PokemonCries {
  latest?: string | null;
  legacy?: string | null;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  flavor_text_entries: {
    flavor_text: string;
    language: NamedResource;
    version: NamedResource;
  }[];
  genera: { genus: string; language: NamedResource }[];
  evolution_chain: { url: string };
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  generation: NamedResource;
  capture_rate: number;
  gender_rate: number;
  egg_groups: NamedResource[];
  hatch_counter: number;
  base_happiness: number | null;
  growth_rate: NamedResource;
  has_gender_differences: boolean;
}

export interface AbilityResponse {
  name: string;
  effect_entries: {
    effect: string;
    short_effect: string;
    language: NamedResource;
  }[];
}

export interface EvolutionDetail {
  trigger: NamedResource;
  min_level?: number | null;
  item?: NamedResource | null;
  held_item?: NamedResource | null;
  known_move?: NamedResource | null;
  known_move_type?: NamedResource | null;
  time_of_day?: string | null;
  min_happiness?: number | null;
  min_affection?: number | null;
  location?: NamedResource | null;
  gender?: number | null;
  party_species?: NamedResource | null;
  needs_overworld_rain?: boolean;
  turn_upside_down?: boolean;
  relative_physical_stats?: number | null;
}

export interface ChainLink {
  species: NamedResource;
  is_baby?: boolean;
  evolution_details?: EvolutionDetail[];
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

export type * from './dexIndex';
