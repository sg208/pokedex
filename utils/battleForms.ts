import type {
  BattleFormKind,
  DexIndexForm,
  DexIndexPokemon,
} from '~/types/pokemon';

export interface BattleForm {
  id: number;
  // Lower-case words, e.g. 'mega charizard x'; display type upper-cases them
  label: string;
  kind: BattleFormKind;
  types: string[];
  bst: number;
  baseBst: number;
}

export const BATTLE_FORM_KINDS: Record<BattleFormKind, string> = {
  mega: 'Mega Evolution',
  primal: 'Primal Reversion',
  gmax: 'Dynamax',
};

const KIND_PREFIX: Record<BattleFormKind, string> = {
  mega: 'mega',
  primal: 'primal',
  gmax: 'gigantamax',
};
const KIND_TOKENS = new Set(['mega', 'primal', 'gmax']);

// 'charizard-mega-x' -> 'mega charizard x'; 'urshifu-rapid-strike-gmax' ->
// 'gigantamax urshifu rapid strike'
export const battleFormLabel = (
  formName: string,
  kind: BattleFormKind
): string =>
  [
    KIND_PREFIX[kind],
    ...formName.split('-').filter((word) => !KIND_TOKENS.has(word)),
  ].join(' ');

// Battle forms of every species in the chain, in chain order
export const pickBattleForms = (
  speciesIds: number[],
  forms: DexIndexForm[],
  pokemon: DexIndexPokemon[]
): BattleForm[] => {
  const speciesById = new Map(pokemon.map((mon) => [mon.id, mon]));
  return speciesIds.flatMap((speciesId) => {
    const species = speciesById.get(speciesId);
    if (!species) return [];
    return forms
      .filter((form) => form.speciesId === speciesId)
      .map((form): BattleForm => ({
        id: form.id,
        label: battleFormLabel(form.name, form.kind),
        kind: form.kind,
        types: form.types,
        bst: form.bst,
        baseBst: species.bst,
      }));
  });
};
