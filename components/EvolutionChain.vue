<script setup lang="ts">
import type { EvolutionStage } from '~/types/pokemon';

interface Props {
  stages: EvolutionStage[];
  currentName: string;
}

defineProps<Props>();
</script>

<template>
  <p v-if="stages.length <= 1">This Pokémon does not evolve.</p>
  <ul v-else class="grid grid-cols-2 gap-0.5 md:grid-cols-3 xl:grid-cols-4">
    <li v-for="(stage, index) in stages" :key="stage.id">
      <NuxtLink
        :to="`/pokemon/${stage.name}`"
        class="stage"
        :aria-current="stage.name === currentName ? 'page' : undefined"
      >
        <img
          :src="artworkUrl(stage.id)"
          :alt="formatName(stage.name)"
          width="475"
          height="475"
          loading="lazy"
          class="stage-art"
          :style="{ '--tilt': index % 2 === 0 ? '4deg' : '-5deg' }"
        />
        <span class="display stage-name">{{ formatName(stage.name) }}</span>
        <span class="tabular font-bold">{{ formatDexNumber(stage.id) }}</span>
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
.stage {
  container-type: inline-size;
  display: flex;
  min-height: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  background: var(--surface);
  padding: 1rem;
  text-decoration: none;
}
.stage[aria-current='page'] {
  background: var(--yellow);
}
.stage-art {
  width: 100%;
  height: auto;
  rotate: var(--tilt);
}
.stage-name {
  font-size: min(2rem, 9cqi);
}
</style>
