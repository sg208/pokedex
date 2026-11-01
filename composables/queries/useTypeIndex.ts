import { useQueries } from '@tanstack/vue-query';
import { computed } from 'vue';
import { fetchType, pokemonKeys } from '~/composables/queries/pokemonQueries';
import { buildPrimaryTypeIndex } from '~/utils/dex';
import { TYPE_NAMES } from '~/utils/typeStyles';

// Fetches the 18 /type lists in the browser and folds them into id -> primary type
export const useTypeIndex = () => {
  const combined = useQueries({
    queries: TYPE_NAMES.map((name) => ({
      queryKey: pokemonKeys.type(name),
      queryFn: () => fetchType(name),
      staleTime: Infinity,
      enabled: import.meta.client,
    })),
    combine: (results) => ({
      isReady: results.every((result) => result.isSuccess),
      isError: results.some((result) => result.isError),
      typeIndex: results.every((result) => result.isSuccess)
        ? buildPrimaryTypeIndex(
            results.flatMap((result) => (result.data ? [result.data] : []))
          )
        : new Map<number, string>(),
    }),
  });
  return {
    typeIndex: computed(() => combined.value.typeIndex),
    isReady: computed(() => combined.value.isReady),
    isError: computed(() => combined.value.isError),
  };
};
