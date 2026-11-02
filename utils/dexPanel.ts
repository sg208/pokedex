import type { NamedResource } from '~/types/pokemon';

interface EffortStat {
  base_stat: number;
  effort: number;
  stat: NamedResource;
}

interface RarityFlags {
  is_mythical: boolean;
  is_legendary: boolean;
  is_baby: boolean;
}

const ROMAN: Record<string, string> = {
  i: 'I',
  ii: 'II',
  iii: 'III',
  iv: 'IV',
  v: 'V',
  vi: 'VI',
  vii: 'VII',
  viii: 'VIII',
  ix: 'IX',
};

const HATCH_STEPS_PER_CYCLE = 255;

// 1 -> "12.5", 4 -> "50": at most one decimal, no trailing zero
const percent = (value: number): string => `${Number(value.toFixed(1))}%`;

// gender_rate is the chance of female in eighths; -1 means genderless
export const formatGenderRatio = (genderRate: number): string => {
  if (genderRate < 0) return 'Genderless';
  const female = (genderRate / 8) * 100;
  if (female === 0) return '100% male';
  if (female === 100) return '100% female';
  return `${percent(100 - female)} male, ${percent(female)} female`;
};

export const formatHatchSteps = (hatchCounter: number): string =>
  ((hatchCounter + 1) * HATCH_STEPS_PER_CYCLE).toLocaleString('en-US');

export const formatEvYield = (stats: EffortStat[]): string => {
  const parts = stats
    .filter((entry) => entry.effort > 0)
    .map((entry) => `${entry.effort} ${statLabel(entry.stat.name)}`);
  return parts.length ? parts.join(', ') : 'None';
};

export const formatGeneration = (name: string): string => {
  const numeral = ROMAN[name.replace(/^generation-/, '')];
  return numeral ? `Generation ${numeral}` : name;
};

export const pickRarityBadge = (
  flags: RarityFlags
): 'Mythical' | 'Legendary' | 'Baby' | null => {
  if (flags.is_mythical) return 'Mythical';
  if (flags.is_legendary) return 'Legendary';
  if (flags.is_baby) return 'Baby';
  return null;
};

export const baseStatTotal = (stats: { base_stat: number }[]): number =>
  stats.reduce((total, entry) => total + entry.base_stat, 0);
