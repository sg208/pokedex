import { defineNuxtModule } from 'nuxt/kit';
import { buildDetailRoutes, DEX_MAX, extractDexNames } from '../utils/pokemon';

const NAMES_URL = `https://pokeapi.co/api/v2/pokemon?limit=${DEX_MAX}`;

// Adds a prerendered shell for every /pokemon/<name> during `nuxt generate`.
// One names request per build; the shells hold no data (ssr: false route rule).
export default defineNuxtModule({
  meta: { name: 'dex-routes' },
  setup: (_options, nuxt) => {
    // nitro.static is true for generate/prerender builds, false for dev and tests
    if (nuxt.options.dev || nuxt.options.nitro?.static !== true) return;

    nuxt.hook('nitro:config', async (nitroConfig) => {
      const response = await fetch(NAMES_URL);
      if (!response.ok) {
        throw new Error(`PokeAPI names request failed: ${response.status}`);
      }
      const routes = buildDetailRoutes(extractDexNames(await response.json()));
      nitroConfig.prerender ??= {};
      nitroConfig.prerender.routes = [
        ...(nitroConfig.prerender.routes ?? []),
        ...routes,
      ];
    });
  },
});
