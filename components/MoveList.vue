<script setup lang="ts">
import type { LevelUpMove } from '~/utils/moves';

interface Props {
  moves: LevelUpMove[];
  versionGroup: string | null;
}

defineProps<Props>();
</script>

<template>
  <p v-if="moves.length === 0">This Pokémon learns no moves by level.</p>
  <template v-else>
    <p class="font-bold">
      As learned in
      <span class="capitalize">{{ formatName(versionGroup ?? '') }}</span>.
      <span class="font-normal">Evo means it learns the move on evolving.</span>
    </p>
    <table class="move-table mt-6">
      <caption class="sr-only">
        Moves learned by level
      </caption>
      <thead>
        <tr>
          <th scope="col">Level</th>
          <th scope="col">Move</th>
          <th scope="col">Power</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(move, index) in moves"
          :key="`${move.level}-${move.name}`"
          :style="{ '--row': index }"
        >
          <td class="tabular display move-level">
            {{ formatLearnLevel(move.level) }}
          </td>
          <th scope="row" class="move-name">
            <span class="display">{{ formatName(move.name) }}</span>
            <span class="move-meta text-small">
              <span
                class="move-type"
                :style="{
                  backgroundColor: getTypeStyle(move.type).bg,
                  color: getTypeStyle(move.type).ink,
                }"
              >
                {{ move.type }}
              </span>
              <span class="move-class">{{ move.damageClass }}</span>
            </span>
          </th>
          <td class="move-power">
            <span class="tabular font-bold">{{ move.power ?? '—' }}</span>
            <span class="power-track" aria-hidden="true">
              <span
                class="power-fill"
                :style="{
                  width: `${movePowerPercent(move.power)}%`,
                  backgroundColor: getTypeStyle(move.type).bg,
                }"
              />
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </template>
</template>

<style scoped>
.move-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 2px;
  text-align: left;
}
th,
td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
}
thead th {
  padding-block: 0.25rem;
  font-size: var(--step-small);
}
tbody tr {
  background: #262626;
}
.move-level {
  width: 4.5rem;
  font-size: 1.5rem;
  line-height: 1;
}
.move-name {
  font-weight: 400;
}
.move-name .display {
  display: block;
  font-size: 1.25rem;
}
.move-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.375rem;
}
.move-class {
  text-transform: capitalize;
}
.move-type {
  padding: 0.125rem 0.5rem;
  font-weight: 800;
  text-transform: capitalize;
}
.move-power {
  width: 40%;
}
.power-track {
  display: block;
  height: 0.75rem;
  margin-top: 0.375rem;
  background: #333;
}
.power-fill {
  display: block;
  height: 100%;
  transform-origin: left;
}
/* Bars sweep in, one row after another, when the table is revealed */
:global(.reveal-pending) .power-fill {
  transform: scaleX(0);
}
:global(.reveal-in) .power-fill {
  transition: transform 700ms var(--ease-out);
  transition-delay: calc(200ms + min(var(--row), 20) * 40ms);
}
@media (max-width: 640px) {
  th,
  td {
    padding: 0.625rem 0.5rem;
  }
  .move-level {
    width: 2.75rem;
    font-size: 1.125rem;
  }
  .move-name .display {
    font-size: 1rem;
  }
  .move-power {
    width: 4rem;
  }
  .power-track {
    display: none;
  }
}
</style>
