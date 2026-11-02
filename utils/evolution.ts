import type {
  ChainLink,
  DexIndexPokemon,
  EvolutionDetail,
  EvolutionStage,
} from '~/types/pokemon';
import { REGIONAL_ONLY } from '~/utils/evolutionMethod';
import { DEX_MAX, parseIdFromUrl } from '~/utils/pokemon';

// Depth-first list of every stage in the chain, branches included
export const flattenChain = (chain: ChainLink): EvolutionStage[] => {
  const id = parseIdFromUrl(chain.species.url);
  const own = id <= DEX_MAX ? [{ id, name: chain.species.name }] : [];
  return [...own, ...chain.evolves_to.flatMap(flattenChain)];
};

// Species names are not always routable (toxtricity); the snapshot holds the default variety name
export const defaultPokemonName = (
  id: number,
  pokemon: DexIndexPokemon[],
  fallback: string
): string => {
  const entry = pokemon[id - 1];
  return entry?.id === id ? entry.name : fallback;
};

export interface EvolutionNode {
  id: number;
  name: string;
  isBaby: boolean;
  details: EvolutionDetail[];
  regionNote?: string;
  children: EvolutionNode[];
}

// Nested stages keeping branches under their real parent; null when the root
// is outside the national dex
export const buildEvolutionTree = (chain: ChainLink): EvolutionNode | null => {
  const id = parseIdFromUrl(chain.species.url);
  if (id > DEX_MAX) return null;
  const regionNote = REGIONAL_ONLY[id];
  return {
    id,
    name: chain.species.name,
    isBaby: chain.is_baby ?? false,
    details: chain.evolution_details ?? [],
    ...(regionNote ? { regionNote } : {}),
    children: chain.evolves_to
      .map(buildEvolutionTree)
      .filter((node): node is EvolutionNode => node !== null),
  };
};
