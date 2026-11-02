import { defineNuxtModule } from 'nuxt/kit';
import type { NitroHooks } from 'nitropack';
import {
  buildDetailHead,
  buildDetailRoutes,
  DEX_MAX,
  extractDexEntries,
  injectHeadTags,
} from '../utils/pokemon';

const NAMES_URL = `https://pokeapi.co/api/v2/pokemon?limit=${DEX_MAX}`;

// Adds a prerendered shell for every /pokemon/<name> during `nuxt generate`.
// One names request per build; the shells hold no data (ssr: false route rule).
export default defineNuxtModule({
  meta: { name: 'dex-routes' },
  setup: (_options, nuxt): void => {
    // nitro.static is true for generate/prerender builds, false for dev and tests
    if (nuxt.options.dev || nuxt.options.nitro?.static !== true) return;

    nuxt.hook('nitro:config', async (nitroConfig): Promise<void> => {
      const response = await fetch(NAMES_URL);
      if (!response.ok) {
        throw new Error(`PokeAPI names request failed: ${response.status}`);
      }
      const entries = extractDexEntries(await response.json());
      const idByName = new Map(entries.map((entry) => [entry.name, entry.id]));
      const routes = buildDetailRoutes(entries.map((entry) => entry.name));
      nitroConfig.prerender ??= {};
      nitroConfig.prerender.routes = [
        ...(nitroConfig.prerender.routes ?? []),
        ...routes,
      ];

      // Give each shell its own title and og/twitter tags; no extra requests
      const injectIntoShell: NitroHooks['prerender:generate'] = (
        route
      ): void => {
        const name = /^\/pokemon\/([^/]+)\/?$/.exec(route.route)?.[1];
        const id = name ? idByName.get(name) : undefined;
        if (!name || id === undefined || !route.fileName?.endsWith('.html')) {
          return;
        }
        route.contents = injectHeadTags(
          route.contents ?? '',
          buildDetailHead(name, id)
        );
      };
      nitroConfig.hooks = {
        ...nitroConfig.hooks,
        'prerender:generate': injectIntoShell,
      };
    });
  },
});
