import type { ChainLink, EvolutionStage } from '~/types/pokemon';
import { DEX_MAX, parseIdFromUrl } from '~/utils/pokemon';

// Depth-first list of every stage in the chain, branches included
export const flattenChain = (chain: ChainLink): EvolutionStage[] => {
  const id = parseIdFromUrl(chain.species.url);
  const own = id <= DEX_MAX ? [{ id, name: chain.species.name }] : [];
  return [...own, ...chain.evolves_to.flatMap(flattenChain)];
};
