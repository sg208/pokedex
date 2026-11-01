# Brain

PURPOSE: decisions, context and open threads not derivable from code.
UPDATE: remove an Open thread when a delta resolves it; never delete Decisions.

## Decisions
- 2026-11-02 — host as a Cloudflare Worker static-assets site at https://pokedex.engg.app (sg208 Cloudflare account); deploy from `main` via `pnpm run deploy`. WHY: static prerendered site, no server. REJECTED: none recorded. SOURCE: bootstrap brief
- 2026-11-02 — prerendered static output; PokeAPI read with no API key. WHY: no backend to host. REJECTED: none recorded. SOURCE: bootstrap brief
- 2026-11-02 — design direction `loud-flat-poster` (taste-skill). WHY: brief tone `bold`, sector `culture`. REJECTED: `type-only-statement`, `colour-chapters` (listed alternates, not chosen). SOURCE: `.taste-skill/direction.json` `direction.id`
- 2026-11-02 — detail pages are shell-only prerenders: `modules/dex-routes.ts` makes one names request per `nuxt generate` and adds `/pokemon/<name>` routes; `/pokemon/**` is `ssr: false`; Worker keeps `not_found_handling: "404-page"`. WHY: real 404s for unknown paths, one PokeAPI call per build. REJECTED: Cloudflare `single-page-application` fallback + 200.html (always 200, hydration mismatch, no real 404s); prerendering data for all 1025 pages (~3000 PokeAPI calls per build, breaks fair use); committed static names JSON (goes stale). SOURCE: plan
- 2026-11-02 — card colour comes from a client-side primary-type index (`useTypeIndex`: 18 `/type/<name>` lists, slot 1, id <= 1025, staleTime Infinity). WHY: the poster design colours each card by type and the list endpoint carries no types. REJECTED: one request per card (1025 calls). SOURCE: plan amendment A-1
- 2026-11-02 — no Nuxt colour-mode module (`ui.colorMode: false`), no i18n, no @nuxt/image, no devtools. WHY: one light poster theme, nothing stored in the browser (privacy page), English only. REJECTED: theme toggle, dark mode, language switcher. SOURCE: plan

## Context
- Product brief: browse all Pokémon from PokeAPI, search, filter by type, open each one for stats and evolutions. SOURCE: `.taste-skill/direction.json` `input.brief`
- Stack planned: Nuxt 4 · Nuxt UI 4 · Tailwind v4 · TanStack Vue Query 5 · pnpm 10 · Vitest + @nuxt/test-utils. SOURCE: bootstrap brief
- Branches: `main` = deploy source, `develop` = integration. SOURCE: bootstrap brief, `git branch -a`
- Sibling reference repo with the same stack and conventions: `/Users/enggaginting/Code/sg208/public/reeeecipe`. Read for shape only; no recipe facts copied.

## Open threads
- Not yet deployed: D-28 (`pnpm run deploy` from `main`, check `/`, `/pokemon/pikachu`, `/pokemon/nope` = 404) is manual; runs after `/enggflo-release`.
- Accepted (ship 2026-11-02): taste-skill inspector on the detail page FAILs `palette-terracotta` / `palette-purple` — the colours are the canonical type colours (`utils/typeStyles.ts`), the subject's own palette; `eyebrow` flags the "All Pokémon" back link (a real control). Home page 0 FAIL; WARN `grey-body` = full ink on coral (4.7:1, highest coral allows), `no-footage` (no honest clip of illustrated creatures).
- Accepted (ship 2026-11-02): D-15 grep finds `api.iconify.design` / fonts endpoint strings inside 3 bundled `_nuxt/*.js` files (Nuxt UI's icon runtime defaults); 0 in HTML/CSS and no icon is rendered, so no request is made. Same in sibling reeeecipe.
- Review deferred to `/enggflo-release` (ship fast path): 23 `explicit-function-return-type` lint warnings; Enter/Space on type chips asserted only as native buttons (happy-dom); real IntersectionObserver / PokeAPI / prefetch behaviour unproven by tests (mocked).
