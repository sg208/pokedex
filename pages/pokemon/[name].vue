<script setup lang="ts">
import {
  useDexIndex,
  usePokemonDetail,
} from '~/composables/queries/pokemonQueries';

const route = useRoute();
const name = computed(() => String(route.params.name ?? ''));
const { pokemon, species, chain } = usePokemonDetail(name);

const data = computed(() => pokemon.data.value);
const stages = computed(() =>
  chain.data.value ? flattenChain(chain.data.value.chain) : []
);

const dexIndex = useDexIndex();
const displayName = computed(() =>
  data.value ? displayNameFor(dexIndex.data.value, data.value.id) : undefined
);
const moveset = computed(() =>
  dexIndex.data.value && data.value
    ? pickLevelUpMoves(
        data.value.moves ?? [],
        dexIndex.data.value.versionGroups,
        dexIndex.data.value.moves
      )
    : null
);
const battleForms = computed(() => {
  const index = dexIndex.data.value;
  if (!index || !data.value) return [];
  const chainIds = stages.value.length
    ? stages.value.map((stage) => stage.id)
    : [data.value.id];
  return pickBattleForms(chainIds, index.forms, index.pokemon);
});

// Unknown names, and forms outside the national dex, are a real 404
watch(
  [(): unknown => pokemon.error.value, data],
  ([error, detail]): void => {
    const isOutsideDex = !!detail && detail.id > DEX_MAX;
    if (getErrorStatus(error) === 404 || isOutsideDex) {
      showError(
        createError({ statusCode: 404, statusMessage: 'Pokémon not found' })
      );
    }
  },
  { immediate: true }
);

useHead((): DetailHead =>
  data.value
    ? buildDetailHead(data.value.name, data.value.id)
    : { title: 'Pokédex', meta: [] }
);
</script>

<template>
  <div>
    <div
      v-if="
        pokemon.isError.value && getErrorStatus(pokemon.error.value) !== 404
      "
      role="alert"
      class="page-frame flex min-h-[60svh] flex-col items-start justify-center gap-4 bg-coral py-16"
    >
      <h1 class="display text-4xl">Could not load</h1>
      <p>The data for this Pokémon did not arrive.</p>
      <button
        type="button"
        class="min-h-12 bg-ink px-6 font-bold text-ground"
        @click="pokemon.refetch()"
      >
        Try again
      </button>
    </div>

    <div
      v-else-if="!data"
      class="page-frame min-h-[80svh] py-16"
      aria-busy="true"
    >
      <h1 class="sr-only">Loading</h1>
      <div class="h-40 w-full bg-surface" />
      <div class="mt-0.5 h-64 w-2/3 bg-surface" />
    </div>

    <template v-else>
      <DetailHero
        :data="data"
        :species="species.data.value"
        :display-name="displayName"
      />

      <DetailSection title="Base stats" tone="black">
        <div v-reveal="1" class="mt-10 max-w-3xl">
          <StatBars :stats="data.stats" />
        </div>
      </DetailSection>

      <DetailSection title="Size" tone="ground">
        <div v-reveal="1" class="mt-10">
          <PokemonFacts
            :height="data.height"
            :weight="data.weight"
            :base-experience="data.base_experience"
          />
        </div>
      </DetailSection>

      <DetailSection title="Pokédex data" tone="surface">
        <DexDataPanel
          v-reveal="1"
          class="mt-10"
          :species="species.data.value"
          :stats="data.stats"
        />
      </DetailSection>

      <DetailSection title="Moves by level" tone="black">
        <div v-reveal="1" class="mt-10 max-w-4xl">
          <MoveList
            v-if="moveset"
            :moves="moveset.moves"
            :version-group="moveset.versionGroup"
          />
          <p v-else-if="dexIndex.isError.value" role="alert">
            Move details did not arrive.
          </p>
          <div v-else class="h-64 w-full bg-[#262626]" aria-busy="true" />
        </div>
      </DetailSection>

      <EvolutionSection
        :chain="chain.data.value?.chain"
        :is-error="chain.isError.value"
        :current-name="data.name"
        :battle-forms="battleForms"
      />

      <DefenseSection
        :types="data.types"
        :abilities="data.abilities"
        :index="dexIndex.data.value"
        :is-error="dexIndex.isError.value"
      />

      <MatchupSection
        :id="data.id"
        :name="data.name"
        :display-name="displayName"
        :index="dexIndex.data.value"
        :is-error="dexIndex.isError.value"
      />

      <DetailSection title="Next up" tone="black">
        <div v-reveal="1" class="mt-10">
          <PokemonPager :name="data.name" />
        </div>
      </DetailSection>
    </template>
  </div>
</template>
