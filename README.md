# Pokédex

A bold Pokédex for all 1,025 National Dex Pokémon, live at https://pokedex.engg.app.

- Browse with infinite scroll
- Search by name or number
- Filter by type, generation and rarity; sort by any stat
- Open a detail page with stats, abilities, flavour text, moves, weaknesses, match-ups, battle forms and the evolution chain

## Stack

- Nuxt 4 and Nuxt UI 4
- Tailwind CSS v4
- TanStack Vue Query 5
- TikTok Sans, self-hosted through `@fontsource-variable`
- Vitest and `@nuxt/test-utils`
- Cloudflare Worker serving static assets

## Scripts

```bash
pnpm install --frozen-lockfile   # install dependencies
pnpm dev                         # dev server
pnpm build                       # nuxt generate, output in .output/public
pnpm preview                     # serve the built site locally
pnpm type-check                  # TypeScript check
pnpm lint                        # lint
pnpm test                        # run tests
pnpm format                      # format with Prettier
pnpm run deploy                  # build and deploy to Cloudflare
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for how deploys work.

## Structure

- `pages/` routes
- `components/` UI components
- `composables/queries/` Vue Query hooks for PokeAPI
- `utils/` shared helpers
- `modules/dex-routes.ts` lists the Pokémon routes to prerender
- `plugins/` Nuxt plugins
- `tests/` unit, component and Playwright e2e tests

## Data and credits

Data comes from [PokeAPI](https://pokeapi.co). Artwork comes from [PokeAPI/sprites](https://github.com/PokeAPI/sprites). Pokémon and their names are trademarks of Nintendo, Creatures Inc. and GAME FREAK. This project is not affiliated with them.

## Licence

MIT © Syailendra Ginting
