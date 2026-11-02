<script setup lang="ts">
import { usePokemonDetail } from '~/composables/queries/pokemonQueries';

const route = useRoute();
const name = computed(() => String(route.params.name ?? ''));
const { pokemon, species, chain } = usePokemonDetail(name);

const data = computed(() => pokemon.data.value);
const style = computed(() => getTypeStyle(data.value?.types[0]?.type.name));
const flavorText = computed(() =>
  pickFlavorText(species.data.value?.flavor_text_entries ?? [])
);
const genus = computed(() => pickGenus(species.data.value?.genera ?? []));
const stages = computed(() =>
  chain.data.value ? flattenChain(chain.data.value.chain) : []
);

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
      <section
        class="detail-hero page-frame"
        :style="{ backgroundColor: style.bg, color: style.ink }"
        :data-ink="style.ink"
        data-chapter
        :data-bg="style.bg"
      >
        <NuxtLink to="/#index" class="back-link">All Pokémon</NuxtLink>

        <div class="detail-grid">
          <div class="detail-name">
            <h1
              v-reveal
              class="display detail-title"
              :style="{ '--fit': nameFitLength(data.name) }"
            >
              {{ formatName(data.name) }}
            </h1>
            <p class="mt-4 font-bold">
              <span class="tabular">{{ formatDexNumber(data.id) }}</span>
              <template v-if="genus"> · {{ genus }}</template>
            </p>
            <ul class="mt-4 flex flex-wrap gap-2" aria-label="Types">
              <li
                v-for="entry in data.types"
                :key="entry.type.name"
                class="type-block"
                :style="{
                  backgroundColor: getTypeStyle(entry.type.name).ink,
                  color: getTypeStyle(entry.type.name).bg,
                }"
              >
                {{ entry.type.name }}
              </li>
            </ul>
            <p v-if="flavorText" class="mt-6 max-w-prose">{{ flavorText }}</p>
            <p class="mt-4">
              <span class="font-bold">Abilities:</span>
              <template
                v-for="(entry, index) in data.abilities"
                :key="entry.ability.name"
              >
                {{ index > 0 ? ', ' : ' ' }}{{ formatName(entry.ability.name)
                }}{{ entry.is_hidden ? ' (hidden)' : '' }}
              </template>
            </p>
          </div>

          <img
            v-reveal="1"
            :src="artworkUrl(data.id)"
            :alt="formatName(data.name)"
            width="475"
            height="475"
            class="detail-art"
          />
        </div>
      </section>

      <section
        class="page-frame bg-field-black py-24 text-field-black-ink md:py-32"
        data-chapter
        data-bg="#1a1a1a"
        data-ink="#e6e0d2"
      >
        <h2 v-reveal class="display section-title">Base stats</h2>
        <div v-reveal="1" class="mt-10 max-w-3xl">
          <StatBars :stats="data.stats" />
        </div>
      </section>

      <section
        class="page-frame py-24 md:py-32"
        data-chapter
        data-bg="#e6e0d2"
        data-ink="#1a1a1a"
      >
        <h2 v-reveal class="display section-title">Size</h2>
        <div v-reveal="1" class="mt-10">
          <PokemonFacts
            :height="data.height"
            :weight="data.weight"
            :base-experience="data.base_experience"
          />
        </div>
      </section>

      <section
        class="page-frame bg-yellow py-24 md:py-32"
        data-chapter
        data-bg="#f2c21a"
        data-ink="#1a1a1a"
      >
        <h2 v-reveal class="display section-title">Evolutions</h2>
        <div v-reveal="1" class="mt-10">
          <EvolutionChain :stages="stages" :current-name="data.name" />
        </div>
      </section>

      <section
        class="page-frame bg-field-black py-24 text-field-black-ink md:py-32"
        data-chapter
        data-bg="#1a1a1a"
        data-ink="#e6e0d2"
      >
        <h2 v-reveal class="display section-title">Next up</h2>
        <div v-reveal="1" class="mt-10">
          <PokemonPager :name="data.name" />
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.detail-hero {
  position: relative;
  z-index: 1;
  min-height: calc(100svh - 3.5rem);
  padding-bottom: 4rem;
}
.back-link {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  font-weight: 800;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
.detail-grid {
  display: grid;
  gap: 2rem;
  margin-top: 2rem;
}
.detail-name {
  container-type: inline-size;
}
/* Fit the longest line: 0.9em per letter at the widest setting, two lines max */
.detail-title {
  font-size: min(22cqi, calc(92cqi / (var(--fit) * 0.9)));
  overflow-wrap: anywhere;
}
.detail-art {
  width: min(80vw, 46svh);
  height: auto;
  justify-self: end;
  rotate: 4deg;
  margin-bottom: -8rem;
}
.type-block {
  padding: 0.5rem 1rem;
  font-weight: 800;
  text-transform: capitalize;
}
.section-title {
  font-size: clamp(2rem, 8vw, 7rem);
}
@media (min-width: 1024px) {
  .detail-grid {
    grid-template-columns: 3fr 2fr;
    align-items: end;
  }
  .detail-art {
    width: min(100%, 60svh);
    margin-bottom: -10rem;
  }
}
</style>
