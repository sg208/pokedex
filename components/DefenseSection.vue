<script setup lang="ts">
import type { DexIndex, PokemonDetail } from '~/types/pokemon';

interface Props {
  types: PokemonDetail['types'];
  abilities: PokemonDetail['abilities'];
  index?: DexIndex;
  isError: boolean;
}

const props = defineProps<Props>();

const typeNames = computed(() => props.types.map((entry) => entry.type.name));
// Hidden abilities are not guaranteed, so they never change the grid
const regularAbilities = computed(() =>
  props.abilities
    .filter((entry) => !entry.is_hidden)
    .map((entry) => entry.ability.name)
);
</script>

<template>
  <section
    class="page-frame bg-surface py-24 md:py-32"
    data-chapter
    data-bg="#dcd5c5"
    data-ink="#1a1a1a"
  >
    <h2 v-reveal class="display section-title">Weaknesses</h2>
    <p v-reveal="1" class="mt-6 max-w-prose">
      Damage taken from each attacking type. A regular ability counts only when
      every regular ability of this Pokémon gives the same immunity; hidden and
      situational abilities are listed above, not applied here.
    </p>
    <WeaknessGrid
      v-if="index"
      v-reveal="2"
      class="mt-10"
      :types="typeNames"
      :abilities="regularAbilities"
      :index="index"
    />
    <p v-else-if="isError" role="alert" class="mt-10">
      Type chart data did not arrive.
    </p>
    <div v-else class="mt-10 h-64 w-full bg-ground" aria-busy="true" />
  </section>
</template>

<style scoped>
.section-title {
  font-size: clamp(2rem, 8vw, 7rem);
}
</style>
