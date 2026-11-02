<script setup lang="ts">
import { useDexNames } from '~/composables/queries/pokemonQueries';
import { usePokemonPrefetch } from '~/composables/usePokemonPrefetch';
import { parseDexEntries } from '~/utils/dex';

interface Props {
  name: string;
}

const props = defineProps<Props>();

const { prefetchOn } = usePokemonPrefetch();
const names = useDexNames(true);

const entries = computed(() =>
  parseDexEntries(names.data.value?.results ?? [])
);
const position = computed(() =>
  entries.value.findIndex((entry) => entry.name === props.name)
);
const previous = computed(() =>
  position.value > 0 ? entries.value[position.value - 1] : undefined
);
const next = computed(() =>
  position.value >= 0 ? entries.value[position.value + 1] : undefined
);
</script>

<template>
  <nav v-if="previous || next" aria-label="Neighbouring Pokémon" class="pager">
    <NuxtLink
      v-if="previous"
      :to="`/pokemon/${previous.name}`"
      class="pager-link"
      v-on="prefetchOn(previous.name)"
    >
      <span class="font-bold">Previous {{ formatDexNumber(previous.id) }}</span>
      <span class="display pager-name">{{ formatName(previous.name) }}</span>
    </NuxtLink>
    <NuxtLink
      v-if="next"
      :to="`/pokemon/${next.name}`"
      class="pager-link pager-next"
      v-on="prefetchOn(next.name)"
    >
      <span class="font-bold">Next {{ formatDexNumber(next.id) }}</span>
      <span class="display pager-name">{{ formatName(next.name) }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.125rem;
}
.pager-link {
  container-type: inline-size;
  display: flex;
  min-height: 11rem;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg);
  color: var(--ink);
  text-decoration: none;
}
.pager-next {
  grid-column: 2;
  text-align: right;
}
.pager-name {
  font-size: min(3rem, 9cqi);
}
</style>
