import type {
  DehydratedState,
  QueryClientConfig,
  VueQueryPluginOptions,
} from '@tanstack/vue-query';
import {
  VueQueryPlugin,
  QueryClient,
  hydrate,
  dehydrate,
} from '@tanstack/vue-query';

const DAY_MS = 24 * 60 * 60 * 1000;

// Exported so tests can pin the caching policy
export const queryClientOptions: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: DAY_MS,
      retry: 2,
      // No garbage-collection timer on the server, so prerendering can exit
      gcTime: import.meta.server ? Infinity : DAY_MS,
      refetchOnWindowFocus: false,
    },
  },
};

export default defineNuxtPlugin({
  name: 'vue-query',
  enforce: 'pre',
  setup(nuxtApp) {
    const vueQueryState = useState<DehydratedState | null>(
      'vue-query',
      () => null
    );

    const queryClient = new QueryClient(queryClientOptions);
    const options: VueQueryPluginOptions = { queryClient };

    nuxtApp.vueApp.use(VueQueryPlugin, options);

    // SSR: dehydrate state on the server
    if (import.meta.server) {
      nuxtApp.hooks.hook('app:rendered', () => {
        vueQueryState.value = dehydrate(queryClient);
      });
    }

    // Client: hydrate state from the server
    if (import.meta.client) {
      nuxtApp.hooks.hook('app:created', () => {
        if (vueQueryState.value) hydrate(queryClient, vueQueryState.value);
      });
    }
  },
});
