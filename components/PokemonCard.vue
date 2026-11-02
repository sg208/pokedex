<script setup lang="ts">
import { usePokemonPrefetch } from '~/composables/usePokemonPrefetch';

interface Props {
  id: number;
  name: string;
  index: number;
  typeName?: string;
}

const props = defineProps<Props>();

const { prefetchOn } = usePokemonPrefetch();
const style = computed(() => getTypeStyle(props.typeName));
const tilt = computed(() => (props.index % 2 === 0 ? 4 : -5));
</script>

<template>
  <li v-reveal="index % 4" class="pokemon-card">
    <NuxtLink
      :to="`/pokemon/${name}`"
      class="card-link"
      :style="{ backgroundColor: style.bg, color: style.ink }"
      :data-ink="style.ink"
      v-on="prefetchOn(name)"
    >
      <span class="card-number tabular">{{ formatDexNumber(id) }}</span>
      <img
        :src="artworkUrl(id)"
        :alt="formatName(name)"
        width="475"
        height="475"
        loading="lazy"
        class="card-art"
        :style="{ '--tilt': `${tilt}deg` }"
      />
      <span class="card-name display">{{ formatName(name) }}</span>
    </NuxtLink>
  </li>
</template>

<style scoped>
.pokemon-card {
  container-type: inline-size;
}
.card-link {
  position: relative;
  display: flex;
  aspect-ratio: 1;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: 6cqi;
  text-decoration: none;
}
.card-number {
  font-weight: 800;
  font-size: max(0.875rem, 6cqi);
}
.card-art {
  position: absolute;
  top: 8cqi;
  right: 2cqi;
  width: 72cqi;
  height: auto;
  rotate: var(--tilt);
}
.card-name {
  position: relative;
  font-size: 8.5cqi;
  overflow-wrap: anywhere;
  max-width: 100%;
}

/* Lift on hover and focus; transform only, interruptible, same speed in and out */
@media (prefers-reduced-motion: no-preference) {
  .card-link {
    transition-property: transform;
    transition-duration: 200ms;
    transition-timing-function: var(--ease-out);
  }
  .card-link:hover,
  .card-link:focus-visible {
    transform: translateY(-6px);
  }
  .card-link:active {
    transform: scale(0.98);
  }
}
</style>
