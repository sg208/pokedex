<script setup lang="ts">
import type { PokemonDetail } from '~/types/pokemon';

interface Props {
  stats: PokemonDetail['stats'];
}

defineProps<Props>();
</script>

<template>
  <ul class="grid gap-4">
    <li
      v-for="entry in stats"
      :key="entry.stat.name"
      :data-stat="entry.stat.name"
      class="stat-row"
    >
      <span class="font-bold">{{ statLabel(entry.stat.name) }}</span>
      <span class="stat-value tabular display">{{ entry.base_stat }}</span>
      <span class="stat-track" aria-hidden="true">
        <span
          class="stat-fill"
          :style="{ width: `${statPercent(entry.base_stat)}%` }"
        />
      </span>
    </li>
  </ul>
</template>

<style scoped>
.stat-row {
  display: grid;
  grid-template-columns: 5.5rem 4.5rem 1fr;
  align-items: center;
  gap: 1rem;
}
.stat-value {
  font-size: 1.5rem;
  white-space: nowrap;
  line-height: 1;
}
.stat-track {
  display: block;
  height: 1.25rem;
  background: #333;
}
.stat-fill {
  display: block;
  height: 100%;
  background: var(--accent);
}
@media (max-width: 480px) {
  .stat-row {
    grid-template-columns: 4.5rem 3.5rem 1fr;
    gap: 0.5rem;
  }
  .stat-value {
    font-size: 1.125rem;
  }
}
</style>
