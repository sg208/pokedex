// Ability to the one type it makes its holder immune to
const IMMUNE_TYPE_BY_ABILITY: Record<string, string> = {
  levitate: 'ground',
  'earth-eater': 'ground',
  'flash-fire': 'fire',
  'well-baked-body': 'fire',
  'water-absorb': 'water',
  'storm-drain': 'water',
  'dry-skin': 'water',
  'volt-absorb': 'electric',
  'lightning-rod': 'electric',
  'motor-drive': 'electric',
  'sap-sipper': 'grass',
};

const WONDER_GUARD = 'wonder-guard';

export interface GuaranteedImmunities {
  types: string[];
  hasWonderGuard: boolean;
}

// What a Pokémon is immune to whichever regular ability it has. Pass regular
// (non-hidden) abilities only: an effect counts only if every one grants it,
// and Wonder Guard only if it is the sole ability.
export const guaranteedImmunities = (
  abilities: string[]
): GuaranteedImmunities => {
  const none = { types: [], hasWonderGuard: false };
  if (abilities.length === 0) return none;
  if (abilities.every((ability) => ability === WONDER_GUARD)) {
    return { types: [], hasWonderGuard: true };
  }
  const [first, ...rest] = abilities.map(
    (ability) => IMMUNE_TYPE_BY_ABILITY[ability]
  );
  if (first === undefined || rest.some((type) => type !== first)) return none;
  return { types: [first], hasWonderGuard: false };
};
