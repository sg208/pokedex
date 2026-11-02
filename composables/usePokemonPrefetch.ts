import { useQueryClient } from '@tanstack/vue-query';
import { prefetchPokemonDetail } from '~/composables/queries/pokemonQueries';

type PrefetchListeners = Record<
  'pointerenter' | 'pointerleave' | 'pointerdown' | 'focus',
  () => void
>;

interface PokemonPrefetch {
  prefetchOn: (name: string) => PrefetchListeners;
}

// A pointer resting this long on a link counts as intent; sweeping across
// the grid does not fire three requests per card
export const HOVER_INTENT_MS = 80;

const isSavingData = (): boolean =>
  import.meta.client &&
  !!(navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection?.saveData;

// Spread on any link to a detail page: v-on="prefetchOn(name)"
export const usePokemonPrefetch = (): PokemonPrefetch => {
  const queryClient = useQueryClient();
  const timer = ref<ReturnType<typeof setTimeout> | null>(null);

  const cancel = (): void => {
    if (timer.value) clearTimeout(timer.value);
    timer.value = null;
  };
  const prefetchNow = (name: string): void => {
    cancel();
    if (isSavingData()) return;
    void prefetchPokemonDetail(queryClient, name);
  };

  onScopeDispose(cancel);

  return {
    prefetchOn: (name) => ({
      pointerenter: (): void => {
        cancel();
        timer.value = setTimeout(() => prefetchNow(name), HOVER_INTENT_MS);
      },
      pointerleave: cancel,
      // Touch has no hover: start on press, ahead of the click
      pointerdown: (): void => prefetchNow(name),
      focus: (): void => prefetchNow(name),
    }),
  };
};
