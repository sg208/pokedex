<script setup lang="ts">
import type { EvolutionNode } from '~/utils/evolution';
import { useDexIndex } from '~/composables/queries/pokemonQueries';
import { usePokemonPrefetch } from '~/composables/usePokemonPrefetch';

interface Props {
  tree: EvolutionNode | null;
  currentName: string;
  hasBattleForms?: boolean;
  isNested?: boolean;
}

const props = defineProps<Props>();

const { prefetchOn } = usePokemonPrefetch();
const dexIndex = useDexIndex();

const hasBranches = computed(() => (props.tree?.children.length ?? 0) > 0);
// Link by the routable default-variety name; species name until the snapshot loads
const routeName = computed(() =>
  props.tree
    ? defaultPokemonName(
        props.tree.id,
        dexIndex.data.value?.pokemon ?? [],
        props.tree.name
      )
    : ''
);
const label = computed(() =>
  props.tree
    ? (displayNameFor(dexIndex.data.value, props.tree.id) ??
      formatName(props.tree.name))
    : ''
);
const method = computed(() =>
  props.tree ? evolutionMethod(props.tree.details) : ''
);
</script>

<template>
  <li v-if="isNested && tree" class="node">
    <NuxtLink
      :to="`/pokemon/${routeName}`"
      class="stage"
      :aria-current="routeName === currentName ? 'page' : undefined"
      v-on="prefetchOn(routeName)"
    >
      <span v-if="method" class="method">
        <span class="sr-only">Evolves by </span>{{ method }}
      </span>
      <span v-if="tree.regionNote" class="method">{{ tree.regionNote }}</span>
      <img
        :src="artworkUrl(tree.id)"
        alt=""
        width="475"
        height="475"
        loading="lazy"
        class="stage-art"
      />
      <span class="display stage-name">{{ label }}</span>
      <span class="tabular font-bold">{{ formatDexNumber(tree.id) }}</span>
      <span v-if="tree.isBaby" class="text-small">Baby form</span>
    </NuxtLink>
    <ul v-if="hasBranches" class="branches">
      <EvolutionTree
        v-for="child in tree.children"
        :key="child.id"
        is-nested
        :tree="child"
        :current-name="currentName"
      />
    </ul>
  </li>
  <p v-else-if="!tree || !hasBranches">
    This Pokémon does not evolve{{
      hasBattleForms ? ', but it can change form in battle.' : '.'
    }}
  </p>
  <ul v-else class="branches root">
    <EvolutionTree is-nested :tree="tree" :current-name="currentName" />
  </ul>
</template>

<style scoped>
.node {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.branches {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  margin-left: 1rem;
  border-left: 0.25rem solid var(--ink);
  padding-left: 0.5rem;
}
.root {
  margin-left: 0;
  border-left: 0;
  padding-left: 0;
}
.stage {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  background: var(--surface);
  padding: 1rem;
  text-decoration: none;
}
.stage[aria-current='page'] {
  background: var(--pale);
  outline: 0.25rem solid var(--ink);
  outline-offset: -0.25rem;
}
.stage[aria-current='page']:focus-visible {
  outline: 4px solid var(--focus);
  outline-offset: 3px;
}
.stage-art {
  width: min(100%, 9rem);
  height: auto;
}
.stage-name {
  font-size: 1.75rem;
  overflow-wrap: anywhere;
}
.method {
  font-weight: 800;
  background: var(--ink);
  color: var(--bg);
  padding: 0.25rem 0.5rem;
}
@media (min-width: 768px) {
  .node {
    flex-direction: row;
    align-items: flex-start;
  }
  .stage {
    width: 14rem;
    flex-shrink: 0;
  }
  .branches {
    flex: 1;
    margin-left: 0;
    border-left: 0;
    padding-left: 0;
  }
}
</style>
