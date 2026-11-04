# Add Playwright e2e specs for home grid, filters and detail page

- **Date**: 2026-11-02 00:56
- **Type**: task
- **Effort**: medium
- **Status**: done
- **Source**: request

## Goal
- Browser-level specs run real PokeAPI data for infinite scroll, Load more, search, type chips (keyboard) and the detail page.

## Context
- `package.json:14,22` — no `@playwright/test` dependency or e2e script; `preview` = `nuxt preview`, `test` = `vitest run`.
- Repo root — no `playwright.config.*` (checked).
- `AGENTS.md:59` — test profile says `e2e ✗ (visual and keyboard QA is manual)`; conflicts with this ask (see Open questions).
- `tests/components/PokemonGrid.spec.ts:9-18` and `tests/components/IndexPage.spec.ts:5-6` — IntersectionObserver faked, `$fetch` mocked; no real scroll loading or real PokeAPI responses.
- `components/PokemonGrid.vue:25,28,78-85` — load trigger via sentinel `useInView`, plus Load more button.
- `components/DexFilters.vue:25-27,52-69` — 250ms search debounce; type chips are native buttons with `aria-pressed`.
- `composables/useDexFilter.ts:18,41-47` and `utils/dex.ts:9` — full name list fetched only while filtering; page size 24.
- `pages/pokemon/[name].vue:18-30` — unknown name raises 404; `nuxt.config.ts:9-11` — `/pokemon/**` is `ssr: false`.
- `modules/dex-routes.ts:12-15` — `nuxt generate` needs PokeAPI network (`AGENTS.md:17`); `vitest.config.ts:11` includes `tests/**`, so e2e specs must live outside `tests/`.
- `.gitignore:54-55` — `test-results` and `playwright-report` already ignored. `.enggflo/brain.md:24` — open thread: real IntersectionObserver, PokeAPI and prefetch unproven.

## Proposed approach
1. Add `@playwright/test` (devDependency) and an `test:e2e` script · files: `package.json`, `playwright.config.ts` · satisfies: D-1, D-2, D-11
   - `webServer: { command: 'pnpm preview', url: 'http://localhost:3000' }`, `testDir: 'e2e'`; the generated build must exist first (`pnpm build`).
2. Spec `e2e/home-grid.spec.ts`: 24 cards on load, Load more → 48, sentinel scroll loads more without a click · files: `e2e/home-grid.spec.ts` · satisfies: D-4, D-6, D-7
3. Spec `e2e/home-filters.spec.ts`: type in search (wait for debounce), Tab to a type chip, Enter toggles `aria-pressed`, no-match text · files: `e2e/home-filters.spec.ts` · satisfies: D-8, D-9
4. Spec `e2e/detail.spec.ts`: `/pokemon/pikachu` shows `#0025`, `/pokemon/nope` returns 404 · files: `e2e/detail.spec.ts` · satisfies: D-10
5. Leave `vitest.config.ts` untouched so `pnpm test` collects no e2e files · files: `vitest.config.ts` · satisfies: D-12
- Cheaper option: one smoke spec (home loads, detail loads) with no webServer, run by hand | none

## Done when
| id | check | expect |
|---|---|---|
| D-1 | `test -f playwright.config.ts` | exit 0 |
| D-2 | `grep -c '"@playwright/test"' package.json` | 1 |
| D-3 | `grep -c "command: 'pnpm preview'" playwright.config.ts` | 1 |
| D-4 | `find e2e -name '*.spec.ts' \| wc -l` | 3 |
| D-5 | `grep -l "route(" e2e/*.spec.ts` | no output (real PokeAPI, no mocks) |
| D-6 | `grep -c "Load more" e2e/home-grid.spec.ts` | ≥ 1 |
| D-7 | `grep -c "scrollTo\|scrollIntoView" e2e/home-grid.spec.ts` | ≥ 1 |
| D-8 | `grep -c "'Enter'" e2e/home-filters.spec.ts` | ≥ 1 |
| D-9 | `grep -c "aria-pressed" e2e/home-filters.spec.ts` | ≥ 1 |
| D-10 | `grep -c "404" e2e/detail.spec.ts` | ≥ 1 |
| D-11 | `pnpm test:e2e` | exit 0 · 0 failed · all 3 spec files listed |
| D-12 | `pnpm test` | exit 0 · no `e2e/` file in output |
| D-13 | `pnpm type-check` | exit 0 |
| D-14 | `pnpm lint` | exit 0 (existing warnings allowed) |
| D-15 | `grep -c "playwright-report\|test-results" .gitignore` | 2 |

## Open questions
- `AGENTS.md:59` says `e2e ✗`. Confirm this item lifts that rule, and whether the test profile row is updated in the same change.

## Also spotted
- `components/PokemonGrid.vue:25` — `handleLoadMore` guard drops emits while `isError`; retry button (`components/PokemonGrid.vue:42`) has no browser-level coverage. Not in scope.

## Resolution

- **Closed**: 2026-11-03 (verified by /enggflo-ship)
- Shipped under `tests/e2e/*.e2e.ts` (not `e2e/*.spec.ts`): `home-grid`, `home-filters`, `detail` + 6 more; webServer `npx serve@14.2.4 .output/public -l 4311` (`playwright.config.ts:16`); `.gitignore` has both report dirs
- `tests/e2e/detail.e2e.ts` asserts 404 · `home-filters` covers Enter + aria-pressed · `home-grid` covers Load more + scroll
- `pnpm test:e2e` run in this pass (see ship report)
