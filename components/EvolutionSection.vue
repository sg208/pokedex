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
  <DetailSection title="Evolutions" tone="yellow">
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
  </DetailSection>
</template>
