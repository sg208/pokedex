# AGENTS.md

- PROJECT: pokedex — bold Pokédex browsing PokeAPI, Nuxt 4 + Nuxt UI + TanStack Vue Query (`README.md:3`)
- STATUS: scaffold and app code in place (home grid, filters, detail page, legal pages); not yet deployed (`package.json`, `wrangler.jsonc`)
- LEARNINGS: `.enggflo/learning.md` · DECISIONS: `.enggflo/brain.md`

## Commands

Verified with pnpm 10 and Node 24 (`package.json` scripts).

```bash
pnpm install       # postinstall runs `nuxt prepare`
pnpm dev           # Nuxt dev server
pnpm test          # vitest run (Nuxt environment, happy-dom)
pnpm test:e2e      # builds, serves .output/public on 4311, Playwright chromium (first time: `pnpm exec playwright install chromium`)
pnpm lint          # eslint . (explicit return types are errors)
pnpm type-check    # vue-tsc --noEmit
pnpm build         # nuxt generate -> .output/public (needs network: one PokeAPI names request)
pnpm preview       # serve the generated output
pnpm run deploy    # pnpm generate && wrangler deploy (from main only)
```

## Task routing

| Task                       | Route                                                                  |
| -------------------------- | ---------------------------------------------------------------------- |
| feature build              | `/enggflo-ship` (commits + pushes current branch, no PR)               |
| bug                        | `/enggflo-bugfix`                                                      |
| UI / visual               | `taste-skill:design-taste-frontend` + `.taste-skill/direction.json`    |
| dependency review          | `/enggflo-maintenance` → `.backlog/` items                             |
| backlog item               | `/enggflo-backlog`                                                     |
| promote develop → main     | `/enggflo-release` (deploy source = `main`)                            |

## Architecture

| Concept          | Path / state                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| stack            | Nuxt 4 · Nuxt UI 4 (`UApp` only) · Tailwind v4 · TanStack Vue Query 5 · pnpm 10 (`package.json`) |
| pages            | `pages/index.vue` (hero, filters, grid) · `pages/pokemon/[name].vue` (detail) · `pages/{privacy,terms,accessibility}.vue` · `error.vue` |
| components       | `components/` — Hero, Header, Footer, PokemonCard/Grid, DexFilters, StatBars, PokemonFacts, EvolutionChain, PokemonPager, LegalPage |
| data layer       | `composables/queries/pokemonQueries.ts` (keys, typed fetchers, composables) · `useTypeIndex.ts` (18 `/type` lists -> id to primary type) · `composables/useDexFilter.ts` |
| pure helpers     | `utils/{pokemon,dex,evolution,typeStyles}.ts` · types in `types/pokemon.ts`                     |
| query client     | `plugins/vue-query.ts` — staleTime/gcTime 24h, retry 2, no refetch on focus                     |
| route generation | `modules/dex-routes.ts` — during `nuxt generate` only, one `GET /pokemon?limit=1025`, adds `/pokemon/<name>` shells to prerender and injects per-Pokémon title/description/OG/Twitter tags into each shell via Nitro `prerender:generate`; `routeRules['/pokemon/**'] = { ssr: false }` |
| styling          | `assets/css/main.css` — tokens, display type, footer, reveal and reduced-motion; font `@fontsource-variable/tiktok-sans/wdth.css` (self-hosted) |
| data source      | PokeAPI, no API key; official artwork from raw.githubusercontent.com                            |
| design direction | `.taste-skill/direction.json` `direction.id` = `loud-flat-poster` (local only, `.git/info/exclude`)                    |
| runtime          | `.node-version:1` = 24                                                                         |
| deploy           | Cloudflare Worker static assets at https://pokedex.engg.app (sg208 account), `pnpm run deploy` from `main` (`wrangler.jsonc`) |
| CI/CD            | none — no `.github/` directory; deploy is manual                                               |
| branches         | `main` = default + deploy source · `develop` = integration                                     |

## Test profile

| field       | value                                                                        |
| ----------- | ---------------------------------------------------------------------------- |
| runner      | Vitest 5 + @nuxt/test-utils, `environment: 'nuxt'`, happy-dom (`vitest.config.ts`) |
| command     | `pnpm test` (all), `pnpm test:e2e` (e2e), `pnpm vitest run tests/unit/pokemon.spec.ts` (one file)   |
| conventions | `tests/unit/*.spec.ts` pure helpers and query layer · `tests/components/*.spec.ts` via `mountSuspended`; `$fetch` mocked with `mockNuxtImport('$fetch')` (a global stub does not work: Nuxt captures it at import); IntersectionObserver faked per test |
| levels      | unit ✓ · component ✓ · e2e ✓ (Playwright, tests/e2e/*.e2e.ts, real PokeAPI)              |
| enforced_by | local only (no CI; `.github/` absent)                                        |

## Project

- WHAT: bold Pokédex built with Nuxt 4, Nuxt UI and TanStack Vue Query on PokeAPI (`README.md:3`)
- BRIEF: browse all Pokémon, search, filter by type, open each one for stats and evolutions (`.taste-skill/direction.json` `input.brief`)
- DEPLOY: static prerendered output on Cloudflare Worker, https://pokedex.engg.app (bootstrap brief)
- BRANCHES: `main` (default) · `develop` (integration) · work branches `<type>/<slug>` off `develop` (global rule)
- COMMITS: no enforced convention observed; one commit `chore: initial commit` (`git log`)

## Gotchas

- Detail pages are prerendered as empty shells (`ssr: false`) and fetch in the browser. Unknown names still get the shell, then `showError` 404 client-side; `not_found_handling` stays `"404-page"`. Rejected: Cloudflare `single-page-application` fallback (always 200, hydration mismatch, no real 404s) and prerendering data for 1025 pages (about 3000 PokeAPI calls per build).
- `nuxt generate` needs network for one PokeAPI request (`modules/dex-routes.ts` asserts 1025 names and last id 1025, else the build fails).
- `ui.colorMode` is `false` on purpose: the colour-mode module writes localStorage, and the privacy page promises no storage.
- `useTypeIndex` is client-only (18 `/type` requests, cached forever); cards are neutral until it loads.
- Design rules (taste-skill, enforced by grep in the plan): square corners, no shadows, borders, gradients, blur, monospace or emoji; one typeface; one h1 per page.
- `main` — remote-only locally (`git branch -a`); `git fetch origin` before any `main` work
- `README.md` — human-owned; enggflo does not restyle it
- taste-skill `inspect.mjs` — run against a served build (`npx serve@14.2.4 .output/public -l 4310` → `http://localhost:4310/`), NEVER the `index.html` path: root-absolute `/_nuxt/` URLs do not resolve (`.enggflo/learning.md` taste-inspect-served-build) <!-- enggflo -->

## References <!-- enggflo -->

- nuxt — https://nuxt.com/llms.txt (llms.txt)
- @tanstack/vue-query — https://tanstack.com/llms.txt (llms.txt)
- @nuxt/ui — https://ui.nuxt.com/llms.txt (llms.txt)
- @fontsource-variable/tiktok-sans — https://fontsource.org/llms.txt (llms.txt)
- vue — https://vuejs.org/llms.txt (llms.txt)
- vitest — https://vitest.dev/llms.txt (llms.txt)
- prettier — https://prettier.io/llms.txt (llms.txt)
