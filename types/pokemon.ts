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
