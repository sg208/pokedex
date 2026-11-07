<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import type { Rarity, SortDir, SortKey } from '~/utils/dexSort';

interface Props {
  query: string;
  type: string | null;
  gen?: number | null;
  rarity?: Rarity | null;
  sort?: SortKey | null;
  dir?: SortDir;
}

const props = withDefaults(defineProps<Props>(), {
  gen: null,
  rarity: null,
  sort: null,
  dir: 'desc',
});
const emit = defineEmits<{
  'update:query': [value: string];
  'update:type': [value: string | null];
  'update:gen': [value: number | null];
  'update:rarity': [value: Rarity | null];
  'update:sort': [value: SortKey | null];
  'update:dir': [value: SortDir];
  clear: [];
}>();

const inputId = useId();
const draft = ref(props.query);

watch(
  () => props.query,
  (value) => {
    draft.value = value;
  }
);

const emitQuery = useDebounceFn((value: string) => {
  emit('update:query', value);
}, 250);

const handleInput = (event: Event): void => {
  draft.value = (event.target as HTMLInputElement).value;
  emitQuery(draft.value);
};

const handleType = (name: string): void => {
  emit('update:type', props.type === name ? null : name);
};
</script>

<template>
  <div>
    <label :for="inputId" class="sr-only">Search by name or number</label>
    <input
      :id="inputId"
      type="search"
      :value="draft"
      placeholder="Search by name or number"
      autocomplete="off"
      class="block min-h-14 w-full bg-surface px-4 font-bold text-ink placeholder:text-muted"
      @input="handleInput"
    />

    <ul class="mt-4 flex flex-wrap gap-2" aria-label="Filter by type">
      <li v-for="name in TYPE_NAMES" :key="name">
        <button
          type="button"
          :aria-pressed="type === name"
          class="type-chip"
          :style="typeChipStyle(name, type === name)"
          @click="handleType(name)"
        >
          {{ name }}
        </button>
      </li>
    </ul>

    <DexControls
      class="mt-4"
      :gen="gen"
      :rarity="rarity"
      :sort="sort"
      :dir="dir"
      @update:gen="emit('update:gen', $event)"
      @update:rarity="emit('update:rarity', $event)"
      @update:sort="emit('update:sort', $event)"
      @update:dir="emit('update:dir', $event)"
      @clear="emit('clear')"
    />
  </div>
</template>

<style scoped>
.type-chip {
  min-height: 2.75rem;
  padding-inline: 1rem;
  font-weight: 800;
  text-transform: capitalize;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
.type-chip[aria-pressed='true'] {
  text-decoration-line: underline;
}
</style>
