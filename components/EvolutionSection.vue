<script setup lang="ts">
import type { ChainLink } from '~/types/pokemon';
import type { BattleForm } from '~/utils/battleForms';

interface Props {
  chain?: ChainLink;
  currentName: string;
  battleForms: BattleForm[];
  isError?: boolean;
}

const props = defineProps<Props>();

const tree = computed(() =>
  props.chain ? buildEvolutionTree(props.chain) : null
);
</script>

<template>
  <section
    class="page-frame bg-yellow py-24 md:py-32"
    data-chapter
    data-bg="#f2c21a"
    data-ink="#1a1a1a"
  >
    <h2 v-reveal class="display section-title">Evolutions</h2>
    <div v-reveal="1" class="mt-10">
      <EvolutionTree
        v-if="tree"
        :tree="tree"
        :current-name="currentName"
        :has-battle-forms="battleForms.length > 0"
      />
      <!-- No chain yet: never claim "does not evolve" before the data says so -->
      <p v-else-if="isError">Evolutions could not be loaded.</p>
      <p v-else aria-live="polite">Loading evolutions…</p>
    </div>
    <BattleForms
      v-if="battleForms.length"
      v-reveal="2"
      class="mt-16"
      :forms="battleForms"
    />
  </section>
</template>

<style scoped>
.section-title {
  font-size: clamp(2rem, 8vw, 7rem);
}
</style>
