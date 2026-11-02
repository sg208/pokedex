<script setup lang="ts">
import { GENERATIONS, RARITIES, SORT_KEYS, isSortKey } from '~/utils/dexSort';
import type { Rarity, SortDir, SortKey } from '~/utils/dexSort';

interface Props {
  gen: number | null;
  rarity: Rarity | null;
  sort: SortKey | null;
  dir: SortDir;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:gen': [value: number | null];
  'update:rarity': [value: Rarity | null];
  'update:sort': [value: SortKey | null];
  'update:dir': [value: SortDir];
  clear: [];
}>();

const genId = useId();
const rarityId = useId();
const sortId = useId();
const dirId = useId();

const isActive = computed(
  () => props.gen !== null || props.rarity !== null || props.sort !== null
);

const valueOf = (event: Event): string =>
  (event.target as HTMLSelectElement).value;

const handleGen = (event: Event): void => {
  const value = valueOf(event);
  emit('update:gen', value ? Number(value) : null);
};
const handleRarity = (event: Event): void => {
  const value = valueOf(event);
  emit('update:rarity', RARITIES.find((item) => item === value) ?? null);
};
const handleSort = (event: Event): void => {
  const value = valueOf(event);
  emit('update:sort', isSortKey(value) ? value : null);
};
const handleDir = (event: Event): void => {
  emit('update:dir', valueOf(event) === 'asc' ? 'asc' : 'desc');
};
</script>

<template>
  <div class="dex-controls">
    <div class="control">
      <label :for="genId">Generation</label>
      <select :id="genId" :value="gen ?? ''" @change="handleGen">
        <option value="">All</option>
        <option v-for="item in GENERATIONS" :key="item" :value="item">
          Generation {{ item }}
        </option>
      </select>
    </div>
    <div class="control">
      <label :for="rarityId">Rarity</label>
      <select :id="rarityId" :value="rarity ?? ''" @change="handleRarity">
        <option value="">All</option>
        <option value="legendary">Legendary</option>
        <option value="mythical">Mythical</option>
      </select>
    </div>
    <div class="control">
      <label :for="sortId">Sort by</label>
      <select :id="sortId" :value="sort ?? ''" @change="handleSort">
        <option value="">Dex number</option>
        <option v-for="key in SORT_KEYS" :key="key" :value="key">
          {{ key === 'total' ? 'Stat total' : statLabel(key) }}
        </option>
      </select>
    </div>
    <div class="control">
      <label :for="dirId">Direction</label>
      <select :id="dirId" :value="dir" @change="handleDir">
        <option value="desc">High to low</option>
        <option value="asc">Low to high</option>
      </select>
    </div>
    <button v-if="isActive" type="button" class="clear" @click="emit('clear')">
      Clear
    </button>
  </div>
</template>

<style scoped>
.dex-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  align-items: end;
}
@media (min-width: 768px) {
  .dex-controls {
    grid-template-columns: repeat(4, 1fr) auto;
  }
}
.control {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}
label {
  font-weight: 800;
  font-size: var(--step-small);
}
select,
.clear {
  min-height: 2.75rem;
  padding-inline: 0.75rem;
  font-weight: 700;
  border: 0;
  border-radius: 0;
  background: var(--surface);
  color: var(--ink);
}
.clear {
  background: var(--ink);
  color: var(--bg);
  padding-inline: 1.5rem;
  font-weight: 800;
}
</style>
