<script setup lang="ts">
interface Props {
  title: string;
  lead: string;
}

defineProps<Props>();
</script>

<template>
  <div
    class="page-frame grid gap-10 py-16 lg:grid-cols-12 lg:gap-12 lg:py-24"
    data-chapter
    data-bg="#e6e0d2"
    data-ink="#1a1a1a"
  >
    <header v-reveal class="lg:col-span-12">
      <h1 class="display legal-title">{{ title }}</h1>
      <p class="mt-6">Updated 2 November 2026</p>
    </header>
    <div v-reveal="1" class="legal-body lg:col-span-7 lg:col-start-1">
      <p class="legal-lead">{{ lead }}</p>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.legal-title {
  font-size: clamp(1.75rem, 8vw, 9rem);
}
.legal-lead {
  font-size: clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);
  line-height: 1.35;
}
.legal-body :deep(h2) {
  margin-top: 3rem;
  font-size: clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);
  font-weight: 800;
  line-height: 1.2;
}
.legal-body :deep(p),
.legal-body :deep(ul) {
  margin-top: 0.75rem;
  max-width: 65ch;
}
.legal-body :deep(ul) {
  padding-left: 1.25rem;
  list-style: disc;
}
.legal-body :deep(li + li) {
  margin-top: 0.5rem;
}
.legal-body :deep(a) {
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
</style>
