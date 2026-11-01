<script setup lang="ts">
interface Props {
  height: number;
  weight: number;
  baseExperience: number | null;
}

defineProps<Props>();
</script>

<template>
  <dl class="facts">
    <div class="fact fact-tall bg-accent text-accent-ink">
      <dt>Height</dt>
      <dd class="display fact-figure">{{ formatHeight(height) }}</dd>
    </div>
    <div class="fact fact-mid bg-ink text-ground">
      <dt>Weight</dt>
      <dd class="display fact-figure">{{ formatWeight(weight) }}</dd>
    </div>
    <div class="fact fact-short bg-surface text-ink">
      <dt>Base experience</dt>
      <dd class="display fact-figure">{{ baseExperience ?? 'n/a' }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: end;
  gap: 0;
}
.fact {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  font-weight: 700;
}
.fact-tall {
  min-height: 18rem;
}
.fact-mid {
  min-height: 12rem;
}
.fact-short {
  min-height: 8rem;
}
.fact-figure {
  font-size: min(3.5rem, 14cqi);
  white-space: nowrap;
  line-height: 0.9;
}
</style>
