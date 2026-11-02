import type { EvolutionDetail } from '~/types/pokemon';

// Evolutions only one regional form makes, keyed by the evolved species id
export const REGIONAL_ONLY: Record<number, string> = {
  862: 'Galarian Linoone only',
  863: 'Galarian Meowth only',
  864: 'Galarian Corsola only',
  865: 'Galarian Farfetch’d only',
  866: 'Galarian Mr. Mime only',
  867: 'Galarian Yamask only',
  903: 'Hisuian Sneasel only',
  904: 'Hisuian Qwilfish only',
  980: 'Paldean Wooper only',
};

const titleCase = (slug: string): string =>
  slug
    .split('-')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');

const GENDERS: Record<number, string> = { 1: 'female', 2: 'male' };
const STAT_COMPARISONS: Record<number, string> = {
  1: 'Attack above Defense',
  0: 'Attack equal to Defense',
  [-1]: 'Attack below Defense',
};

const headOf = (detail: EvolutionDetail): string => {
  const trigger = detail.trigger.name;
  if (trigger === 'trade') return 'Trade';
  if (trigger === 'use-item') {
    return detail.item ? titleCase(detail.item.name) : 'Use item';
  }
  if (trigger !== 'level-up') return titleCase(trigger);
  if (detail.min_level) return `Lv ${detail.min_level}`;
  if (detail.min_happiness) return 'Friendship';
  if (detail.min_affection) return 'Affection';
  return 'Level up';
};

const extrasOf = (detail: EvolutionDetail): string[] => {
  const extras: (string | number | false | null | undefined)[] = [
    // Friendship and affection lead the text only when there is no level
    detail.min_level && detail.min_happiness && 'Friendship',
    detail.min_level && detail.min_affection && 'Affection',
    detail.known_move && `knowing ${titleCase(detail.known_move.name)}`,
    detail.known_move_type &&
      `knowing a ${titleCase(detail.known_move_type.name)}-type move`,
    detail.time_of_day,
    detail.location && `at ${titleCase(detail.location.name)}`,
    detail.gender != null && GENDERS[detail.gender],
    detail.party_species &&
      `with ${titleCase(detail.party_species.name)} in the party`,
    detail.needs_overworld_rain && 'while it rains',
    detail.turn_upside_down && 'console held upside down',
    detail.relative_physical_stats != null &&
      STAT_COMPARISONS[detail.relative_physical_stats],
  ];
  return extras.filter(
    (extra): extra is string => typeof extra === 'string' && !!extra
  );
};

const describeOne = (detail: EvolutionDetail): string => {
  const held = detail.held_item
    ? ` holding ${titleCase(detail.held_item.name)}`
    : '';
  return [`${headOf(detail)}${held}`, ...extrasOf(detail)].join(', ');
};

// Readable text for how a species evolves; several details join with " or "
export const evolutionMethod = (details: EvolutionDetail[]): string =>
  [...new Set(details.map(describeOne))].join(' or ');
