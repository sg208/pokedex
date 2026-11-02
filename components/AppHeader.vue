<script setup lang="ts">
const { bg, ink } = useChapterInk();

const linkClass =
  'inline-flex min-h-11 items-center underline-offset-4 decoration-2 hover:underline';
</script>

<template>
  <header
    class="site-header page-frame"
    :data-ink="ink"
    :style="{ '--header-bg': bg, '--header-ink': ink }"
  >
    <NuxtLink to="/" :class="[linkClass, 'font-extrabold']">Pokédex</NuxtLink>
    <nav aria-label="Main">
      <ul class="flex gap-6">
        <li>
          <NuxtLink to="/#index" :class="linkClass">Index</NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
