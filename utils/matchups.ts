import type { DexIndex, DexIndexPokemon } from '~/types/pokemon';
import { guaranteedImmunities } from '~/utils/abilityImmunity';

export interface Matchup {
  pokemon: DexIndexPokemon;
  // Best same-type hit the opponent lands on the target, and the reverse
  dealt: number;
  taken: number;
  edge: number;
}

export interface Matchups {
  nemeses: Matchup[];
  prey: Matchup[];
  bstBand: number;
}

export const MATCHUP_COUNT = 5;
// Widen the base stat total band until both lists can fill
const BST_BANDS = [0.1, 0.2, 0.35];
// Immunity counts as ×1/8 so it still ranks below ×0.25
const FLOOR = 0.125;

// Damage multiplier of one attacking type against the defender, with the
// defender's regular abilities applied
export const defensiveMultiplier = (
  attackType: string,
  defenderTypes: string[],
  defenderAbilities: string[],
  index: Pick<DexIndex, 'types' | 'chart'>
): number => {
  const position = (type: string): number => index.types.indexOf(type);
  const typed = defenderTypes.reduce(
    (product, defend) =>
      product * (index.chart[position(attackType)]?.[position(defend)] ?? 1),
    1
  );
  const { types, hasWonderGuard } = guaranteedImmunities(defenderAbilities);
  if (types.includes(attackType)) return 0;
  return hasWonderGuard && typed <= 1 ? 0 : typed;
};

// Best multiplier any of the attacker's types gets against the defender
export const bestHit = (
  attacker: string[],
  defender: string[],
  index: Pick<DexIndex, 'types' | 'chart'>,
  defenderAbilities: string[] = []
): number =>
  Math.max(
    ...attacker.map((attack) =>
      defensiveMultiplier(attack, defender, defenderAbilities, index)
    )
  );

const toMatchup = (
  target: DexIndexPokemon,
  opponent: DexIndexPokemon,
  index: Pick<DexIndex, 'types' | 'chart'>
): Matchup => {
  const dealt = bestHit(opponent.types, target.types, index, target.abilities);
  const taken = bestHit(
    target.types,
    opponent.types,
    index,
    opponent.abilities
  );
  return {
    pokemon: opponent,
    dealt,
    taken,
    edge: Math.log2(Math.max(dealt, FLOOR)) - Math.log2(Math.max(taken, FLOOR)),
  };
};

// Opponents at the same evolution standing (fully evolved or not) with a
// similar base stat total, ranked by type advantage
export const findMatchups = (
  target: DexIndexPokemon,
  index: Pick<DexIndex, 'types' | 'chart' | 'pokemon'>,
  count: number = MATCHUP_COUNT
): Matchups => {
  const peers = index.pokemon.filter(
    (mon) => mon.id !== target.id && mon.isFinal === target.isFinal
  );
  const rankWithin = (band: number): Matchups => {
    const matchups = peers
      .filter((mon) => Math.abs(mon.bst - target.bst) <= target.bst * band)
      .map((mon) => toMatchup(target, mon, index));
    const nemeses = matchups
      .filter((matchup) => matchup.edge > 0)
      .sort(
        (left, right) =>
          right.edge - left.edge ||
          right.pokemon.bst - left.pokemon.bst ||
          left.pokemon.id - right.pokemon.id
      )
      .slice(0, count);
    const prey = matchups
      .filter((matchup) => matchup.edge < 0)
      .sort(
        (left, right) =>
          left.edge - right.edge ||
          left.pokemon.bst - right.pokemon.bst ||
          left.pokemon.id - right.pokemon.id
      )
      .slice(0, count);
    return { nemeses, prey, bstBand: band };
  };
  const ranked = BST_BANDS.map(rankWithin);
  return (
    ranked.find(
      (entry) => entry.nemeses.length >= count && entry.prey.length >= count
    ) ?? (ranked.at(-1) as Matchups)
  );
};

export const formatMultiplier = (value: number): string =>
  value === 0 ? '×0' : `×${value}`;
