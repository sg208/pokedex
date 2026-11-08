import { type QueryObserverResult, useQueries } from '@tanstack/vue-query';
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
import { fetchType } from '~/composables/queries/pokemonFetchers';
import { pokemonKeys } from '~/composables/queries/pokemonQueries';
import type { TypeResponse } from '~/types/pokemon';
import { buildPrimaryTypeIndex, buildTypeMembers } from '~/utils/dex';
import { TYPE_NAMES } from '~/utils/typeStyles';

interface TypeIndex {
  typeIndex: ComputedRef<Map<number, string>>;
  typeMembers: ComputedRef<Map<number, string[]>>;
  isReady: ComputedRef<boolean>;
  isError: ComputedRef<boolean>;
}

interface CombinedTypeIndex {
  isReady: boolean;
  isError: boolean;
  typeIndex: Map<number, string>;
  typeMembers: Map<number, string[]>;
}

// Fetches the 18 /type lists in the browser and folds them into id -> primary type and id -> all types
export const useTypeIndex = (): TypeIndex => {
  const combined = useQueries({
    queries: TYPE_NAMES.map((name) => ({
      queryKey: pokemonKeys.type(name),
      queryFn: (): Promise<TypeResponse> => fetchType(name),
      staleTime: Infinity,
      enabled: import.meta.client,
    })),
    combine: (
      results: QueryObserverResult<TypeResponse, Error>[]
    ): CombinedTypeIndex => {
      const isReady = results.every((result) => result.isSuccess);
      const responses = results.flatMap((result) =>
        result.data ? [result.data] : []
      );
      return {
        isReady,
        isError: results.some((result) => result.isError),
        typeIndex: isReady
          ? buildPrimaryTypeIndex(responses)
          : new Map<number, string>(),
        typeMembers: isReady
          ? buildTypeMembers(responses)
          : new Map<number, string[]>(),
      };
    },
  });
  return {
    typeIndex: computed(() => combined.value.typeIndex),
    typeMembers: computed(() => combined.value.typeMembers),
    isReady: computed(() => combined.value.isReady),
    isError: computed(() => combined.value.isError),
  };
};
