import { computed, ref, watch } from 'vue';
import { useDexNames } from '~/composables/queries/pokemonQueries';
import { filterDex, PAGE_SIZE, parseDexEntries } from '~/utils/dex';

// Search and type filtering over the full name list, with local "load more" slicing.
// The 1025 names are only fetched once a filter is active.
export const useDexFilter = (
  typeIndex: Ref<Map<number, string>>,
  isTypeIndexReady: Ref<boolean>
) => {
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
    retry: () => names.refetch(),
  };
};
