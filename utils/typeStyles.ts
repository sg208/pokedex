export const TYPE_NAMES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export type TypeName = (typeof TYPE_NAMES)[number];

export interface TypeStyle {
  bg: string;
  ink: string;
}

const DARK_INK = '#1a1a1a';
const BONE_INK = '#e6e0d2';

// Flat fields; ink picked so every pair clears 4.5:1
const TYPE_STYLES: Record<TypeName, TypeStyle> = {
  normal: { bg: '#a8a77a', ink: DARK_INK },
  fire: { bg: '#ee8130', ink: DARK_INK },
  water: { bg: '#6390f0', ink: DARK_INK },
  electric: { bg: '#f7d02c', ink: DARK_INK },
  grass: { bg: '#7ac74c', ink: DARK_INK },
  ice: { bg: '#96d9d6', ink: DARK_INK },
  fighting: { bg: '#a82520', ink: BONE_INK },
  poison: { bg: '#8e3a8c', ink: BONE_INK },
  ground: { bg: '#e2bf65', ink: DARK_INK },
  flying: { bg: '#a98ff3', ink: DARK_INK },
  psychic: { bg: '#f95587', ink: DARK_INK },
  bug: { bg: '#a6b91a', ink: DARK_INK },
  rock: { bg: '#b6a136', ink: DARK_INK },
  ghost: { bg: '#735797', ink: BONE_INK },
  dragon: { bg: '#5f2be0', ink: BONE_INK },
  dark: { bg: '#705746', ink: BONE_INK },
  steel: { bg: '#b7b7ce', ink: DARK_INK },
  fairy: { bg: '#d685ad', ink: DARK_INK },
};

// Used until the type index loads, and for types outside the 18
export const NEUTRAL_STYLE: TypeStyle = { bg: '#dcd5c5', ink: DARK_INK };

export const getTypeStyle = (name?: string): TypeStyle =>
  TYPE_STYLES[name as TypeName] ?? NEUTRAL_STYLE;

// A type alias, not an interface: Vue's CSSProperties needs the implicit index signature
export type TypeChipStyle = { backgroundColor: string; color: string };

export const typeChipStyle = (
  name?: string,
  isInverted = false
): TypeChipStyle => {
  const { bg, ink } = getTypeStyle(name);
  return isInverted
    ? { backgroundColor: ink, color: bg }
    : { backgroundColor: bg, color: ink };
};
