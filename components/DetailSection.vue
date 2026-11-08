<script setup lang="ts">
type Tone = 'ground' | 'surface' | 'coral' | 'yellow' | 'black';

interface Props {
  title: string;
  tone: Tone;
}

interface ToneStyle {
  classes: string;
  bg: string;
  ink: string;
}

defineProps<Props>();

// Full literal class strings: Tailwind v4 only emits classes it can read here
const toneStyles: Record<Tone, ToneStyle> = {
  ground: {
    classes: 'page-frame py-24 md:py-32',
    bg: '#e6e0d2',
    ink: '#1a1a1a',
  },
  surface: {
    classes: 'page-frame bg-surface py-24 md:py-32',
    bg: '#dcd5c5',
    ink: '#1a1a1a',
  },
  coral: {
    classes: 'page-frame bg-coral py-24 md:py-32',
    bg: '#ed4b44',
    ink: '#1a1a1a',
  },
  yellow: {
    classes: 'page-frame bg-yellow py-24 md:py-32',
    bg: '#f2c21a',
    ink: '#1a1a1a',
  },
  black: {
    classes: 'page-frame bg-field-black py-24 text-field-black-ink md:py-32',
    bg: '#1a1a1a',
    ink: '#e6e0d2',
  },
};
</script>

<template>
  <section
    :class="toneStyles[tone].classes"
    data-chapter
    :data-bg="toneStyles[tone].bg"
    :data-ink="toneStyles[tone].ink"
  >
    <h2 v-reveal class="display section-title">{{ title }}</h2>
    <slot />
  </section>
</template>

<style scoped>
.section-title {
  font-size: clamp(2rem, 8vw, 7rem);
}
</style>
