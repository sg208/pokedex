# Add per-Pokémon title, description and Open Graph tags at generate time

- **Date**: 2026-11-02 00:56
- **Type**: task
- **Effort**: medium
- **Status**: ready
- **Source**: request

## Goal
- Each `/pokemon/<name>` link shared to a chat, search or social feed previews its own name, dex number and artwork.

## Context
- `pages/pokemon/[name].vue:32-37` — `useHead` sets `title` only, and only in the browser; no `description`, `og:*` or `twitter:*` tags exist anywhere in the repo.
- `modules/dex-routes.ts:14-25` — one `GET /pokemon?limit=1025` in `nitro:config` already yields every name and id, so no extra PokeAPI call is needed.
- `utils/pokemon.ts:82-93` — `extractDexNames` keeps names only; `parseIdFromUrl` (`utils/pokemon.ts:16-20`) can read the id from each `url` in the same response.
- `utils/pokemon.ts:34` `formatName` and `utils/pokemon.ts:22-23` `formatDexNumber` give the title text; `utils/pokemon.ts:36` `artworkUrl(id)` gives `og:image`.
- `nuxt.config.ts:9-11` — `/pokemon/**` is `ssr: false`, so the generated shell has no page-level head; `nuxt.config.ts:51` lists only `/` and legal routes as static roots.
- `wrangler.jsonc:4-7` — static assets site, no Worker script; `.enggflo/brain.md:10` rejects the SPA fallback and full data prerender.
- Flavour text is not in the names list, so the description uses name and dex number only.

## Proposed approach
1. Return `{ name, id }` pairs from `extractDexNames` (keep the 1025 and last-id asserts) · files: `utils/pokemon.ts`, `modules/dex-routes.ts` · satisfies: D-4, D-6
2. Add a pure `buildDetailHead(name, id, origin)` helper returning `title`, `description`, `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card` · files: `utils/pokemon.ts`, `tests/unit/pokemon.spec.ts` · satisfies: D-5, D-6
3. Inject those tags into each `/pokemon/<name>/index.html` after prerender, via a Nitro prerender hook (confirm the exact hook at build time) · files: `modules/dex-routes.ts` · satisfies: D-1, D-2, D-3
4. Use the same helper in `useHead` so client and shell values match (no hydration diff) · files: `pages/pokemon/[name].vue` · satisfies: D-7
- Cheaper option: set only `<title>` and `description` in the shell, skip `og:*`; still needs step 3 · no PokeAPI cost.

### Options evaluated
| option | PokeAPI calls | build time | runtime cost | verdict |
|---|---|---|---|---|
| (a) generate-time head per name | 0 extra (reuses names request) | +~1 MB HTML, seconds | none | **recommended** |
| (b) keep client-only | 0 | 0 | 0 | no crawler tags, rejected |
| (c1) Worker HTML rewrite, bundled name→id map | 0 | 0 | new Worker script, map can go stale | architecture change, rejected |
| (c2) Worker rewrite fetching flavour text | 1 per uncached crawler hit (cacheable) | 0 | Worker + Cache API | rejected, flavour text not needed |

WHY (a): zero per-Pokémon calls and no new runtime, so it fits the one-names-request rule in `brain.md:10`; the id is already in the response.

## Done when
| id | check | expect |
|---|---|---|
| D-1 | `pnpm build` | exit 0 |
| D-2 | `grep -o 'og:title' .output/public/pokemon/pikachu/index.html \| wc -l` | 1 |
| D-3 | `grep -o 'Pikachu #0025 - Pokédex' .output/public/pokemon/pikachu/index.html \| wc -l` | ≥1 |
| D-4 | `find .output/public/pokemon -name index.html \| wc -l` | 1025 |
| D-5 | `grep -c 'Bulbasaur' .output/public/pokemon/pikachu/index.html` | 0 |
| D-6 | `pnpm test` | exit 0, new spec covers `buildDetailHead` |
| D-7 | `pnpm type-check` and `grep -c 'buildDetailHead' pages/pokemon/[name].vue` | exit 0 · count 1 |
| D-8 | `grep -c 'fetch(' modules/dex-routes.ts` | 1 (still one names request) |

## Open questions
- none

## Also spotted
- `nuxt.config.ts:51` — `/`, `/privacy`, `/terms`, `/accessibility` also have no description or OG tags; own item if wanted.
