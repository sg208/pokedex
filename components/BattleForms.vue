<script setup lang="ts">
import type { BattleForm } from '~/utils/battleForms';

interface Props {
  forms: BattleForm[];
}

defineProps<Props>();
</script>

<template>
  <div>
    <h3 class="display forms-title">Battle forms</h3>
    <p class="mt-2 max-w-prose">
      Temporary changes during a battle. They are not evolutions, and the
      Pokémon returns to normal afterwards.
    </p>
    <ul class="mt-6 grid grid-cols-1 gap-0.5 sm:grid-cols-2 xl:grid-cols-4">
      <li v-for="(form, index) in forms" :key="form.id" class="form">
        <span class="form-kind text-small">
          {{ BATTLE_FORM_KINDS[form.kind] }}
        </span>
        <img
          :src="artworkUrl(form.id)"
          alt=""
          width="475"
          height="475"
          loading="lazy"
          class="form-art"
          :style="{ '--tilt': index % 2 === 0 ? '-4deg' : '5deg' }"
        />
        <span class="display form-name">{{ form.label }}</span>
        <ul class="flex flex-wrap gap-1" aria-label="Types">
          <li
            v-for="type in form.types"
            :key="type"
            class="form-type"
            :style="typeChipStyle(type)"
          >
            {{ type }}
          </li>
        </ul>
        <span class="font-bold">
          Stat total
          <span class="tabular">{{ form.bst }}</span>
          <template v-if="form.bst !== form.baseBst">
            <span class="tabular"> (+{{ form.bst - form.baseBst }}) </span>
          </template>
        </span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.forms-title {
  font-size: clamp(1.75rem, 5vw, 3.5rem);
}
.form {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  background: var(--field-black);
  color: var(--field-black-ink);
  padding: 1rem;
}
.form-kind {
  background: var(--field-black-ink);
  color: var(--field-black);
  padding: 0.125rem 0.5rem;
  font-weight: 800;
  text-transform: uppercase;
}
.form-art {
  width: 100%;
  height: auto;
  rotate: var(--tilt);
}
.form-name {
  font-size: min(2rem, 9cqi);
}
.form-type {
  padding: 0.125rem 0.5rem;
  font-size: var(--step-small);
  font-weight: 800;
  text-transform: capitalize;
}
</style>
