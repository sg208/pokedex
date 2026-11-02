<script setup lang="ts">
interface Props {
  name: string;
  defaultSrc: string;
  shinySrc: string;
  fallbackSrc: string;
}

const props = defineProps<Props>();

const isShiny = ref(false);
const failed = ref<string[]>([]);

const hasShiny = computed(() => props.shinySrc !== props.defaultSrc);
// First candidate that has not failed to load
const src = computed(
  () =>
    [
      ...(isShiny.value ? [props.shinySrc] : []),
      props.defaultSrc,
      props.fallbackSrc,
    ].find((candidate) => !failed.value.includes(candidate)) ??
    props.fallbackSrc
);
const alt = computed(() =>
  isShiny.value && src.value === props.shinySrc
    ? `${formatName(props.name)}, shiny`
    : formatName(props.name)
);

const handleToggle = (): void => {
  isShiny.value = !isShiny.value;
};
const handleError = (): void => {
  failed.value = [...failed.value, src.value];
};
</script>

<template>
  <div class="viewer">
    <button
      v-if="hasShiny"
      type="button"
      class="shiny-toggle"
      :aria-pressed="isShiny"
      @click="handleToggle"
    >
      Shiny
    </button>
    <img
      :src="src"
      :alt="alt"
      width="475"
      height="475"
      class="detail-art"
      @error="handleError"
    />
  </div>
</template>

<style scoped>
.viewer {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}
.shiny-toggle {
  min-height: 2.75rem;
  padding: 0 1.5rem;
  background: var(--ink);
  color: var(--bg);
  font-weight: 800;
  transition-property: background-color, color;
  transition-duration: var(--duration-press);
}
.shiny-toggle[aria-pressed='true'] {
  background: var(--accent);
  color: var(--accent-ink);
}
.detail-art {
  width: min(80vw, 46svh);
  height: auto;
  rotate: 4deg;
  margin-bottom: -8rem;
}
@media (min-width: 1024px) {
  .detail-art {
    width: min(100%, 60svh);
    margin-bottom: -10rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .shiny-toggle {
    transition: none;
  }
}
</style>
