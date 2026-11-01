<script setup lang="ts">
import type { NuxtError } from '#app';

interface Props {
  error: NuxtError;
}

const props = defineProps<Props>();

const statusCode = computed(() => props.error?.statusCode ?? 500);
const isNotFound = computed(() => statusCode.value === 404);
const title = computed(() =>
  isNotFound.value ? 'Page not found' : 'Page error'
);
const body = computed(() =>
  isNotFound.value
    ? 'There is no page at this address. It may have moved, or the name may be wrong.'
    : `The page could not load (error ${statusCode.value}). Try again in a moment.`
);

useHead({
  htmlAttrs: { lang: 'en' },
  title: computed(() => `${title.value} - Pokédex`),
  meta: [{ name: 'robots', content: 'noindex' }],
});
</script>

<template>
  <UApp>
    <NuxtLayout>
      <section
        class="field-coral page-frame flex min-h-[70svh] flex-col justify-between gap-12 py-12"
        data-chapter
        data-bg="#ed4b44"
        data-ink="#1a1a1a"
      >
        <h1 class="display error-title">{{ title }}</h1>
        <div class="max-w-xl">
          <p>{{ body }}</p>
          <a
            href="/"
            class="mt-6 inline-flex min-h-12 items-center bg-ink px-6 font-bold text-ground"
          >
            Back to the Pokédex
          </a>
        </div>
      </section>
    </NuxtLayout>
  </UApp>
</template>

<style scoped>
.error-title {
  font-size: clamp(2.25rem, 10vw, 11rem);
}
</style>
