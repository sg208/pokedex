<script setup lang="ts">
import { useQueries } from '@tanstack/vue-query';
import { abilityQueryOptions } from '~/composables/queries/pokemonQueries';
import type { PokemonDetail } from '~/types/pokemon';

interface Props {
  abilities: PokemonDetail['abilities'];
}

const props = defineProps<Props>();

const results = useQueries({
  queries: computed(() =>
    props.abilities.map((entry) => abilityQueryOptions(entry.ability.name))
  ),
});

const rows = computed(() =>
  props.abilities.map((entry, position) => {
    const result = results.value[position];
    const english = result?.data?.effect_entries.find(
      (item) => item.language.name === 'en'
    );
    return {
      name: entry.ability.name,
      isHidden: entry.is_hidden,
      isLoading: !!result?.isPending && !result.isError,
      effect: english?.short_effect ?? null,
    };
  })
);
</script>

<template>
  <ul class="abilities" aria-label="Abilities">
    <li v-for="row in rows" :key="row.name" class="ability">
      <p class="font-bold">
        <span class="capitalize">{{ formatName(row.name) }}</span>
        <span v-if="row.isHidden" class="hidden-mark">Hidden ability</span>
      </p>
      <p v-if="row.isLoading" class="effect" aria-busy="true">
        Loading effect…
      </p>
      <p v-else-if="row.effect" class="effect">{{ row.effect }}</p>
      <p v-else class="effect">Effect description unavailable.</p>
    </li>
  </ul>
</template>

<style scoped>
.abilities {
  display: grid;
  gap: 0.75rem;
}
.ability {
  border-left: 0.25rem solid currentcolor;
  padding-left: 0.75rem;
}
.hidden-mark {
  margin-left: 0.5rem;
  font-size: var(--step-small);
  text-transform: uppercase;
}
.effect {
  min-height: 1.5em;
  max-width: 60ch;
  overflow-wrap: anywhere;
}
</style>
