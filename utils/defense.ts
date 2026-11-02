import type { DexIndex } from '~/types/pokemon';
import { defensiveMultiplier } from '~/utils/matchups';

export interface WeaknessBucket {
  multiplier: number;
  label: string;
  types: string[];
}

// Strongest weakness first, immunity last
const BUCKET_MULTIPLIERS = [4, 2, 0.5, 0.25, 0];
const LABELS: Record<number, string> = {
  4: '×4',
  2: '×2',
  0.5: '×½',
  0.25: '×¼',
  0: '×0',
};

export const multiplierLabel = (value: number): string =>
  LABELS[value] ?? `×${value}`;

// All 18 attacking types grouped by the damage they deal to this Pokémon.
// Neutral (×1) types are left out; every other bucket is returned, even empty.
export const groupWeaknesses = (
  defenderTypes: string[],
  defenderAbilities: string[],
  index: Pick<DexIndex, 'types' | 'chart'>
): WeaknessBucket[] =>
  BUCKET_MULTIPLIERS.map((multiplier) => ({
    multiplier,
    label: multiplierLabel(multiplier),
    types: index.types.filter(
      (attack) =>
        defensiveMultiplier(attack, defenderTypes, defenderAbilities, index) ===
        multiplier
    ),
  }));
