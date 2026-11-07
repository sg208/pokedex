<script setup lang="ts">
import type { DexIndex } from '~/types/pokemon';

interface Props {
  name: string;
  displayName?: string;
  id: number;
  index?: DexIndex;
  isError: boolean;
}

const props = defineProps<Props>();

const target = computed(() =>
  props.index?.pokemon.find((mon) => mon.id === props.id)
);
const matchups = computed(() =>
  props.index && target.value ? findMatchups(target.value, props.index) : null
);
</script>

<template>
  <DetailSection title="Match-ups" tone="coral">
    <p v-reveal="1" class="mt-6 max-w-prose">
      Opponents that are also
      {{ target?.isFinal ? 'fully evolved' : 'yet to evolve fully' }}, with a
      base stat total within {{ Math.round((matchups?.bstBand ?? 0.1) * 100) }}%
      of <span class="capitalize">{{ displayName ?? formatName(name) }}</span
      >'s, ranked by how hard each side's own types hit the other. Regular
      abilities that grant an immunity, such as Levitate, count.
    </p>
    <div v-if="matchups" class="mt-10 grid gap-16 lg:grid-cols-2 lg:gap-8">
      <MatchupList
        v-reveal="2"
        title="Arch nemeses"
        description="The five worst opponents to meet."
        empty-text="No opponent here has the type edge."
        :matchups="matchups.nemeses"
        :current-name="name"
      />
      <MatchupList
        v-reveal="3"
        title="Slaughterhouse"
        description="The five easiest opponents to beat."
        empty-text="No opponent here is at a type disadvantage."
        :matchups="matchups.prey"
        :current-name="name"
      />
    </div>
    <p v-else-if="isError" role="alert" class="mt-10">
      Match-up data did not arrive.
    </p>
    <div v-else class="mt-10 h-64 w-full bg-surface" aria-busy="true" />
  </DetailSection>
</template>
