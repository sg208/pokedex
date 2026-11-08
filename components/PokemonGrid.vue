<script setup lang="ts">
import type { DexEntry } from '~/types/pokemon';
import { useInView } from '~/composables/useInView';

interface Props {
  items: DexEntry[];
  hasMore: boolean;
  isFetching: boolean;
  isError: boolean;
  typeIndex?: Map<number, string>;
  displayNames?: Map<number, string>;
}

const props = withDefaults(defineProps<Props>(), {
  typeIndex: () => new Map<number, string>(),
  displayNames: () => new Map<number, string>(),
});

const emit = defineEmits<{
  loadMore: [];
  retry: [];
}>();

const sentinel = ref<HTMLElement | null>(null);

const handleLoadMore = (): void => {
  if (props.hasMore && !props.isFetching && !props.isError) emit('loadMore');
};

useInView(sentinel, handleLoadMore);

const buttonClass =
  'inline-flex min-h-12 items-center bg-ink px-6 font-bold text-ground aria-disabled:opacity-60';
</script>

<template>
  <div>
    <div
      v-if="isError"
      role="alert"
      class="flex flex-wrap items-center gap-4 bg-coral p-6"
    >
      <p class="font-bold">The Pokémon could not be loaded.</p>
      <button type="button" :class="buttonClass" @click="emit('retry')">
        Try again
      </button>
    </div>

    <p
      v-else-if="items.length === 0 && !isFetching"
      class="bg-surface p-6 font-bold"
    >
      No Pokémon match that search. Try another name or clear the filters.
    </p>

    <ul
      v-if="items.length > 0"
      class="grid grid-cols-2 gap-0.5 md:grid-cols-3 xl:grid-cols-4"
    >
      <PokemonCard
        v-for="(item, index) in items"
        :id="item.id"
        :key="item.id"
        :name="item.name"
        :index="index"
        :type-name="typeIndex.get(item.id)"
        :display-name="displayNames.get(item.id)"
      />
    </ul>

    <div
      v-else-if="isFetching"
      class="grid grid-cols-2 gap-0.5 md:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
    >
      <div v-for="i in 8" :key="i" class="aspect-square bg-surface" />
    </div>

    <!-- Stays mounted so screen readers announce the text when it changes. -->
    <p role="status" class="sr-only">
      {{ isFetching ? 'Loading Pokémon…' : '' }}
    </p>

    <div class="flex justify-center py-12">
      <button
        v-if="hasMore && !isError"
        type="button"
        :class="buttonClass"
        :aria-disabled="isFetching"
        @click="handleLoadMore"
      >
        {{ isFetching ? 'Loading' : 'Load more' }}
      </button>
    </div>
    <div ref="sentinel" aria-hidden="true" />
  </div>
</template>
