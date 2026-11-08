<script setup lang="ts">
import type { PokemonDetail, PokemonSpecies } from '~/types/pokemon';

interface Props {
  data: PokemonDetail;
  species?: PokemonSpecies;
  displayName?: string;
}

const props = defineProps<Props>();

const style = computed(() => getTypeStyle(props.data.types[0]?.type.name));
const title = computed(() => props.displayName ?? formatName(props.data.name));
const genus = computed(() => pickGenus(props.species?.genera ?? []));
</script>

<template>
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
          :style="{ '--fit': nameFitLength(title) }"
        >
          {{ title }}
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
            :style="typeChipStyle(entry.type.name, true)"
          >
            {{ entry.type.name }}
          </li>
        </ul>
        <FlavorPicker
          v-if="species"
          class="mt-6"
          :entries="species.flavor_text_entries"
        />
        <AbilityList class="mt-6" :abilities="data.abilities" />
        <CryButton
          class="mt-4"
          :src="pickCryUrl(data.cries)"
          :name="data.name"
        />
      </div>

      <ArtworkViewer
        v-reveal="1"
        class="detail-viewer"
        :name="data.name"
        :default-src="defaultArtworkUrl(data.sprites, data.id)"
        :shiny-src="shinyArtworkUrl(data.sprites, data.id)"
        :fallback-src="artworkUrl(data.id)"
      />
    </div>
  </section>
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
/*
 * Fit the longest line, two lines max. --em-per-letter is measured, not guessed:
 * across all 1025 names at wdth 150 / weight 800 the widest cases that the
 * 22cqi cap does not already save need 1.09em per letter (Mewtwo, Wormadam
 * Plant, Kommo-o, Pawmo); 1.15 adds about 5% headroom.
 */
.detail-title {
  --em-per-letter: 1.15;
  font-size: min(22cqi, calc(92cqi / (var(--fit) * var(--em-per-letter))));
  overflow-wrap: anywhere;
}
.detail-viewer {
  justify-self: end;
}
.type-block {
  padding: 0.5rem 1rem;
  font-weight: 800;
  text-transform: capitalize;
}
@media (min-width: 1024px) {
  .detail-grid {
    grid-template-columns: 3fr 2fr;
    align-items: end;
  }
}
</style>
