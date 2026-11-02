import type { DexIndexMove, PokemonMove } from '~/types/pokemon';

export interface LevelUpMove {
  name: string;
  level: number;
  type: string;
  power: number | null;
  damageClass: string;
}

export interface LevelUpMoveset {
  versionGroup: string | null;
  moves: LevelUpMove[];
}

const LEVEL_UP = 'level-up';
const UNKNOWN_MOVE: DexIndexMove = {
  type: 'normal',
  power: null,
  damageClass: 'status',
};

// Level-up moves from the newest game that teaches this Pokémon any by level
export const pickLevelUpMoves = (
  moves: PokemonMove[],
  versionGroupOrder: Record<string, number>,
  moveIndex: Record<string, DexIndexMove>
): LevelUpMoveset => {
  const levelUp = moves.flatMap((entry) =>
    entry.version_group_details
      .filter((detail) => detail.move_learn_method.name === LEVEL_UP)
      .map((detail) => ({
        name: entry.move.name,
        level: detail.level_learned_at,
        group: detail.version_group.name,
      }))
  );
  const versionGroup =
    levelUp
      .map((entry) => entry.group)
      .sort(
        (left, right) =>
          (versionGroupOrder[right] ?? -1) - (versionGroupOrder[left] ?? -1)
      )[0] ?? null;

  return {
    versionGroup,
    moves: levelUp
      .filter((entry) => entry.group === versionGroup)
      .map((entry): LevelUpMove => ({
        name: entry.name,
        level: entry.level,
        ...(moveIndex[entry.name] ?? UNKNOWN_MOVE),
      }))
      .sort(
        (left, right) =>
          left.level - right.level || left.name.localeCompare(right.name)
      ),
  };
};

// Level 0 means the move is taught on evolution in recent games
export const formatLearnLevel = (level: number): string =>
  level === 0 ? 'Evo' : String(level);

// Move power as a share of 250, the strongest damaging move
export const movePowerPercent = (power: number | null): number =>
  power ? Math.round(Math.min(power / 250, 1) * 100) : 0;
