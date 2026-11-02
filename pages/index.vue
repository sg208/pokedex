<script setup lang="ts">
import { usePokemonInfiniteList } from '~/composables/queries/pokemonQueries';
import { useDexFilter } from '~/composables/useDexFilter';
import { useTypeIndex } from '~/composables/queries/useTypeIndex';
import { parseDexEntries } from '~/utils/dex';

useHead({
  title: 'Pokédex - every Pokémon, with stats, types and evolutions',
  meta: [
    {
      name: 'description',
      content:
        'Every one of the 1,025 Pokémon in the National Pokédex, with stats, types and evolutions. Data from PokeAPI.',
    },
  ],
});

const list = usePokemonInfiniteList();
const { typeIndex, typeMembers, isReady: isTypeIndexReady } = useTypeIndex();
const filter = useDexFilter(typeMembers, isTypeIndexReady);

// Prerender the first page so the grid is in the HTML
if (import.meta.server) await list.suspense();

const listItems = computed(() =>
  (list.data.value?.pages ?? []).flatMap((page) =>
    parseDexEntries(page.results)
  )
);

const items = computed(() =>
  filter.isFiltering.value ? filter.items.value : listItems.value
);
const hasMore = computed(() =>
  filter.isFiltering.value ? filter.hasMore.value : list.hasNextPage.value
);
const isFetching = computed(() =>
  filter.isFiltering.value ? filter.isLoading.value : list.isFetching.value
);
const isError = computed(() =>
  filter.isFiltering.value ? filter.isError.value : list.isError.value
);

const handleLoadMore = (): void => {
  if (filter.isFiltering.value) filter.loadMore();
  else void list.fetchNextPage();
};

const handleClearControls = (): void => {
  filter.gen.value = null;
  filter.rarity.value = null;
  filter.sort.value = null;
  filter.dir.value = 'desc';
};

const handleRetry = (): void => {
  if (filter.isFiltering.value) void filter.retry();
  else void list.refetch();
};
</script>

<template>
  <div>
    <HeroSection />

    <section
      id="index"
      class="page-frame py-24 md:py-32"
      data-chapter
      data-bg="#e6e0d2"
      data-ink="#1a1a1a"
    >
      <div class="index-heading">
        <h2 v-reveal class="display index-title">Index</h2>
      </div>

      <div class="mt-12">
        <DexFilters
          v-model:query="filter.query.value"
          v-model:type="filter.type.value"
          v-model:gen="filter.gen.value"
          v-model:rarity="filter.rarity.value"
          v-model:sort="filter.sort.value"
          v-model:dir="filter.dir.value"
          @clear="handleClearControls"
        />
      </div>

      <div class="mt-6">
        <PokemonGrid
          :items="items"
          :has-more="hasMore"
          :is-fetching="isFetching"
          :is-error="isError"
          :type-index="typeIndex"
          :display-names="filter.displayNames.value"
          @load-more="handleLoadMore"
          @retry="handleRetry"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.index-heading {
  container-type: inline-size;
}
.index-title {
  font-size: 19cqi;
}
</style>
