import { computed, onMounted, ref, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { DexEntry } from '~/types/pokemon';
import { useDexIndex, useDexNames } from '~/composables/queries/pokemonQueries';
import { filterDex, PAGE_SIZE, parseDexEntries } from '~/utils/dex';
import { buildDexQuery, isSameDexState, parseDexQuery } from '~/utils/dexQuery';
import type { DexQueryState } from '~/utils/dexQuery';
import { filterByTraits, sortEntries } from '~/utils/dexSort';
import type { Rarity, SortDir, SortKey } from '~/utils/dexSort';

interface DexFilter {
  query: Ref<string>;
  type: Ref<string | null>;
  gen: Ref<number | null>;
  rarity: Ref<Rarity | null>;
  sort: Ref<SortKey | null>;
  dir: Ref<SortDir>;
  displayNames: ComputedRef<Map<number, string>>;
  isFiltering: ComputedRef<boolean>;
  items: ComputedRef<DexEntry[]>;
  hasMore: ComputedRef<boolean>;
  isLoading: ComputedRef<boolean>;
  isError: ComputedRef<boolean>;
  loadMore: () => void;
  retry: () => Promise<unknown>;
}

// Search, type, generation, rarity and sort over the full name list, with local "load more" slicing.
// The 1025 names are only fetched once a filter is active.
export const useDexFilter = (
  typeMembers: Ref<Map<number, string[]>>,
  isTypeIndexReady: Ref<boolean>
): DexFilter => {
  const query = ref('');
  const type = ref<string | null>(null);
  const gen = ref<number | null>(null);
  const rarity = ref<Rarity | null>(null);
  const sort = ref<SortKey | null>(null);
  const dir = ref<SortDir>('desc');
  const visibleCount = ref(PAGE_SIZE);

  const route = useRoute();
  const router = useRouter();
  // The static page is prerendered unfiltered, so the URL is applied after mount
  const isSynced = ref(false);

  const state = computed<DexQueryState>(() => ({
    query: query.value,
    type: type.value,
    gen: gen.value,
    rarity: rarity.value,
    sort: sort.value,
    dir: dir.value,
  }));

  const applyRoute = (): void => {
    const next = parseDexQuery(route.query);
    query.value = next.query;
    type.value = next.type;
    gen.value = next.gen;
    rarity.value = next.rarity;
    sort.value = next.sort;
    dir.value = next.dir;
  };

  // route.query lags behind an in-flight router.replace, so writes are compared
  // with what was last written, and older writes landing late are ignored.
  // WHY: comparing with route.query let a fast on-off toggle snap back on.
  const writes: { latest: DexQueryState | null; stale: DexQueryState[] } = {
    latest: null,
    stale: [],
  };

  onMounted(() => {
    applyRoute();
    writes.latest = parseDexQuery(route.query);
    isSynced.value = true;
  });

  // Outside URL changes (back and forward, links); echoes of own writes are skipped
  watch(
    () => route.query,
    () => {
      if (!isSynced.value) return;
      const incoming = parseDexQuery(route.query);
      if (writes.latest && isSameDexState(incoming, writes.latest)) {
        writes.stale = [];
        return;
      }
      if (writes.stale.some((old) => isSameDexState(incoming, old))) return;
      writes.latest = incoming;
      writes.stale = [];
      applyRoute();
    }
  );

  watch(state, (next) => {
    if (!isSynced.value) return;
    if (writes.latest && isSameDexState(writes.latest, next)) return;
    if (writes.latest) writes.stale.push(writes.latest);
    writes.latest = { ...next };
    void router.replace({
      query: buildDexQuery(route.query, next),
      hash: route.hash,
    });
  });

  // Generation, rarity and sort read the snapshot
  const needsIndex = computed(
    () => gen.value !== null || rarity.value !== null || sort.value !== null
  );
  const isFiltering = computed(
    () => query.value.trim() !== '' || type.value !== null || needsIndex.value
  );
  const names = useDexNames(isFiltering);
  const index = useDexIndex();

  const displayNames = computed(
    () =>
      new Map(
        (index.data.value?.pokemon ?? []).map((mon) => [
          mon.id,
          mon.displayName,
        ])
      )
  );

  const matches = computed(() => {
    const entries = parseDexEntries(names.data.value?.results ?? []);
    const found = filterDex(entries, {
      query: query.value,
      type: type.value,
      typeMembers: typeMembers.value,
      displayNames: displayNames.value,
    });
    if (!needsIndex.value) return found;
    // Metadata is joined from the snapshot by id; nothing to show until it loads
    if (!index.data.value) return [];
    const traited = filterByTraits(found, index.data.value, {
      gen: gen.value,
      rarity: rarity.value,
    });
    return sort.value
      ? sortEntries(traited, index.data.value, sort.value, dir.value)
      : traited;
  });

  const items = computed(() => matches.value.slice(0, visibleCount.value));
  const hasMore = computed(() => visibleCount.value < matches.value.length);

  // Waiting on names, the snapshot when it is needed, or the type lists when a type is chosen
  const isLoading = computed(
    () =>
      isFiltering.value &&
      (names.isFetching.value ||
        (needsIndex.value && index.isFetching.value) ||
        (type.value !== null && !isTypeIndexReady.value))
  );
  const isError = computed(
    () =>
      isFiltering.value &&
      (names.isError.value || (needsIndex.value && index.isError.value))
  );

  watch(state, () => {
    visibleCount.value = PAGE_SIZE;
  });

  const loadMore = (): void => {
    visibleCount.value += PAGE_SIZE;
  };

  const retry = (): Promise<unknown> =>
    Promise.all([
      names.isError.value ? names.refetch() : undefined,
      index.isError.value ? index.refetch() : undefined,
    ]);

  return {
    query,
    type,
    gen,
    rarity,
    sort,
    dir,
    displayNames,
    isFiltering,
    items,
    hasMore,
    isLoading,
    isError,
    loadMore,
    retry,
  };
};
