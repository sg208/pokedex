import { computed, ref, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { DexEntry } from '~/types/pokemon';
import { useDexNames } from '~/composables/queries/pokemonQueries';
import { filterDex, PAGE_SIZE, parseDexEntries } from '~/utils/dex';

interface DexFilter {
  query: Ref<string>;
  type: Ref<string | null>;
  isFiltering: ComputedRef<boolean>;
  items: ComputedRef<DexEntry[]>;
  hasMore: ComputedRef<boolean>;
  isLoading: ComputedRef<boolean>;
  isError: ComputedRef<boolean>;
  loadMore: () => void;
  retry: () => Promise<unknown>;
}

// Search and type filtering over the full name list, with local "load more" slicing.
// The 1025 names are only fetched once a filter is active.
export const useDexFilter = (
  typeIndex: Ref<Map<number, string>>,
  isTypeIndexReady: Ref<boolean>
): DexFilter => {
  const query = ref('');
  const type = ref<string | null>(null);
  const visibleCount = ref(PAGE_SIZE);

  const isFiltering = computed(
    () => query.value.trim() !== '' || type.value !== null
  );
  const names = useDexNames(isFiltering);

  const matches = computed(() => {
    const entries = parseDexEntries(names.data.value?.results ?? []);
    return filterDex(entries, {
      query: query.value,
      type: type.value,
      typeIndex: typeIndex.value,
    });
  });

  const items = computed(() => matches.value.slice(0, visibleCount.value));
  const hasMore = computed(() => visibleCount.value < matches.value.length);

  // Waiting on names, or on the type lists when a type is chosen
  const isLoading = computed(
    () =>
      isFiltering.value &&
      (names.isFetching.value ||
        (type.value !== null && !isTypeIndexReady.value))
  );
  const isError = computed(() => isFiltering.value && names.isError.value);

  watch([query, type], () => {
    visibleCount.value = PAGE_SIZE;
  });

  const loadMore = (): void => {
    visibleCount.value += PAGE_SIZE;
  };

  return {
    query,
    type,
    isFiltering,
    items,
    hasMore,
    isLoading,
    isError,
    loadMore,
    retry: (): Promise<unknown> => names.refetch(),
  };
};
