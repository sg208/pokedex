<script setup lang="ts">
const HERO_ID = 25;
</script>

<template>
  <section
    class="hero field-coral page-frame"
    data-chapter
    data-bg="#ed4b44"
    data-ink="#1a1a1a"
  >
    <h1 v-reveal class="display hero-title">
      <span class="block text-pale">Gotta</span>
      <span class="block">find 'em</span>
    </h1>

    <img
      v-reveal="1"
      :src="artworkUrl(HERO_ID)"
      alt="Pikachu"
      width="475"
      height="475"
      fetchpriority="high"
      decoding="async"
      class="hero-art"
    />

    <div v-reveal="2" class="hero-bottom">
      <p class="hero-copy">
        A Pokédex of all 1,025 Pokémon, with stats, types and evolutions from
        PokeAPI.
      </p>
      <a href="#index" class="hero-button press">Browse all</a>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: flex;
  min-height: calc(100svh - 3.5rem);
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
  overflow: clip;
  padding-block: 10svh 2rem;
}
.hero-title {
  position: relative;
  z-index: 1;
  font-size: 15vw;
}
.hero-art {
  position: absolute;
  right: var(--margin);
  bottom: 2rem;
  width: min(48vw, 34svh);
  height: auto;
  rotate: 5deg;
}
.hero-bottom {
  position: relative;
  display: flex;
  max-width: 34ch;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.25rem;
}
.hero-copy {
  font-size: clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem);
  line-height: 1.3;
}
.hero-button {
  display: inline-flex;
  min-height: 3.25rem;
  align-items: center;
  background: var(--ink);
  color: var(--pale);
  padding-inline: 1.75rem;
  font-weight: 800;
  text-decoration: none;
}
.hero-button:hover {
  background: var(--pale);
  color: var(--ink);
}
@media (max-width: 767px) {
  .hero-art {
    top: 36%;
    bottom: auto;
    width: 64vw;
  }
}
@media (min-width: 768px) {
  .hero {
    padding-top: 8svh;
  }
  .hero-title {
    font-size: clamp(110px, 14vw, 220px);
  }
  .hero-art {
    width: min(36vw, 52svh);
    bottom: 0;
  }
}
</style>
