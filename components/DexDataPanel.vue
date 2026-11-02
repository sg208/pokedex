<script setup lang="ts">
import type { PokemonDetail, PokemonSpecies } from '~/types/pokemon';

// Only the dex facts, so callers need not hold the whole species payload
type PanelSpecies = Omit<
  PokemonSpecies,
  'id' | 'name' | 'flavor_text_entries' | 'genera' | 'evolution_chain'
>;

interface Props {
  species?: PanelSpecies;
  stats: PokemonDetail['stats'];
}

const props = defineProps<Props>();

const badge = computed(() =>
  props.species ? pickRarityBadge(props.species) : null
);
const rows = computed(() => {
  const species = props.species;
  if (!species) return [];
  return [
    ['Generation', formatGeneration(species.generation.name)],
    ['Catch rate', String(species.capture_rate)],
    ['Gender ratio', formatGenderRatio(species.gender_rate)],
    [
      'Egg groups',
      species.egg_groups.map((group) => formatName(group.name)).join(', ') ||
        'None',
    ],
    ['Hatch steps', formatHatchSteps(species.hatch_counter)],
    ['Base friendship', String(species.base_happiness ?? 'n/a')],
    ['Growth rate', formatName(species.growth_rate.name)],
    ['EV yield', formatEvYield(props.stats)],
    ['Base stat total', String(baseStatTotal(props.stats))],
    [
      'Visible gender differences',
      species.has_gender_differences ? 'Yes' : 'No',
    ],
  ];
});
</script>

<template>
  <div v-if="species">
    <p v-if="badge" class="rarity-badge display">{{ badge }}</p>
    <dl class="panel">
      <div v-for="[label, value] in rows" :key="label" class="cell">
        <dt class="text-small">{{ label }}</dt>
        <dd class="value">{{ value }}</dd>
      </div>
    </dl>
  </div>
  <div v-else class="h-64 w-full bg-ground" aria-busy="true" />
</template>

<style scoped>
.rarity-badge {
  display: inline-block;
  margin-bottom: 1.5rem;
  padding: 0.5rem 1rem;
  background: var(--ink);
  color: var(--bg);
  font-size: 1.5rem;
}
.panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 2px;
}
.cell {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 6rem;
  padding: 1rem;
  background: var(--bg);
}
dt {
  overflow-wrap: normal;
  font-weight: 700;
}
.value {
  font-size: 1.25rem;
  font-weight: 800;
  text-transform: capitalize;
  overflow-wrap: break-word;
}
</style>
