<script setup lang="ts">
import type { Matchup } from '~/utils/matchups';
import { usePokemonPrefetch } from '~/composables/usePokemonPrefetch';

interface Props {
  title: string;
  description: string;
  matchups: Matchup[];
  emptyText: string;
  currentName: string;
}

defineProps<Props>();

const { prefetchOn } = usePokemonPrefetch();
</script>

<template>
  <div class="matchup-list">
    <h3 class="display matchup-title">{{ title }}</h3>
    <p class="mt-2 max-w-prose">{{ description }}</p>
    <p v-if="matchups.length === 0" class="mt-6 font-bold">{{ emptyText }}</p>
    <ol v-else class="mt-6 grid gap-0.5">
      <li v-for="(matchup, index) in matchups" :key="matchup.pokemon.id">
        <NuxtLink
          :to="`/pokemon/${matchup.pokemon.name}`"
          class="matchup"
          v-on="prefetchOn(matchup.pokemon.name)"
        >
          <span class="display tabular matchup-rank">{{ index + 1 }}</span>
          <img
            :src="artworkUrl(matchup.pokemon.id)"
            alt=""
            width="475"
            height="475"
            loading="lazy"
            class="matchup-art"
          />
          <span class="matchup-body">
            <span class="display matchup-name">
              {{
                matchup.pokemon.displayName || formatName(matchup.pokemon.name)
              }}
            </span>
            <span class="flex flex-wrap gap-1">
              <span
                v-for="type in matchup.pokemon.types"
                :key="type"
                class="matchup-type"
                :style="typeChipStyle(type)"
              >
                {{ type }}
              </span>
            </span>
            <span class="text-small font-bold">
              <span class="capitalize">{{ formatName(currentName) }}</span> hits
              {{ formatMultiplier(matchup.taken) }}, takes
              {{ formatMultiplier(matchup.dealt) }} · Stat total
              <span class="tabular">{{ matchup.pokemon.bst }}</span>
            </span>
          </span>
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.matchup-list {
  container-type: inline-size;
}
/* Fit 'Slaughterhouse' on one line at the widest setting */
.matchup-title {
  font-size: min(3.5rem, 7cqi);
}
.matchup {
  display: grid;
  grid-template-columns: 2.5rem 5rem 1fr;
  align-items: center;
  gap: 1rem;
  background: var(--surface);
  padding: 0.75rem 1rem;
  text-decoration: none;
  transition: background-color var(--duration-press) var(--ease-out);
}
.matchup:hover {
  background: var(--pale);
}
.matchup-rank {
  font-size: 2rem;
  line-height: 1;
}
.matchup-art {
  width: 5rem;
  height: auto;
}
.matchup-body {
  display: grid;
  gap: 0.375rem;
  min-width: 0;
}
.matchup-name {
  font-size: 1.25rem;
}
.matchup-type {
  padding: 0.125rem 0.5rem;
  font-size: var(--step-small);
  font-weight: 800;
  text-transform: capitalize;
}
@media (max-width: 480px) {
  .matchup {
    grid-template-columns: 1.75rem 3.5rem 1fr;
    gap: 0.625rem;
    padding: 0.625rem;
  }
  .matchup-rank {
    font-size: 1.5rem;
  }
  .matchup-art {
    width: 3.5rem;
  }
}
</style>
