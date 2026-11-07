<script setup lang="ts">
import type { DexIndex } from '~/types/pokemon';

interface Props {
  types: string[];
  // Regular (non-hidden) abilities: only guaranteed immunities count
  abilities: string[];
  index: Pick<DexIndex, 'types' | 'chart'>;
}

const props = defineProps<Props>();

const buckets = computed(() =>
  groupWeaknesses(props.types, props.abilities, props.index)
);
</script>

<template>
  <ul class="buckets" aria-label="Damage taken by attacking type">
    <li v-for="bucket in buckets" :key="bucket.label" class="bucket">
      <p class="bucket-label display">
        {{ bucket.label }}
        <span class="sr-only">damage taken from</span>
      </p>
      <ul v-if="bucket.types.length" class="flex flex-wrap gap-1">
        <li
          v-for="type in bucket.types"
          :key="type"
          class="chip"
          :style="typeChipStyle(type)"
        >
          {{ type }}
        </li>
      </ul>
      <p v-else class="bucket-empty">None</p>
    </li>
  </ul>
</template>

<style scoped>
.buckets {
  display: grid;
  gap: 0.125rem;
}
.bucket {
  display: grid;
  gap: 0.5rem;
  align-content: start;
  background: var(--surface);
  padding: 1rem;
}
.bucket-label {
  font-size: 2rem;
}
.bucket-empty {
  color: var(--muted);
  font-weight: 700;
}
.chip {
  padding: 0.25rem 0.75rem;
  font-weight: 800;
  text-transform: capitalize;
}
@media (min-width: 640px) {
  .buckets {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .buckets {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
