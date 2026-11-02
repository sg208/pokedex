<script setup lang="ts">
import type { PokemonSpecies } from '~/types/pokemon';

interface Props {
  entries: PokemonSpecies['flavor_text_entries'];
}

const props = defineProps<Props>();

const selectId = useId();
const versions = computed(() => listFlavorVersions(props.entries));
const chosen = ref<string | null>(null);
const current = computed(
  () => chosen.value ?? defaultFlavorVersion(versions.value)
);
const active = computed(() =>
  versions.value.find((item) => item.version === current.value)
);

const handleChange = (event: Event): void => {
  chosen.value = (event.target as HTMLSelectElement).value;
};
</script>

<template>
  <div v-if="active">
    <div v-if="versions.length > 1" class="picker">
      <label :for="selectId" class="font-bold">Game</label>
      <select
        :id="selectId"
        :value="current"
        class="picker-select"
        @change="handleChange"
      >
        <option
          v-for="item in versions"
          :key="item.version"
          :value="item.version"
        >
          {{ formatName(item.version) }}
        </option>
      </select>
    </div>
    <p class="mt-4 max-w-prose">{{ active.text }}</p>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
.picker-select {
  min-height: 2.75rem;
  padding: 0 0.75rem;
  background: var(--ink);
  color: var(--bg);
  font-weight: 700;
  text-transform: capitalize;
}
</style>
