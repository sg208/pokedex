# Add explicit return types to composables, utils and test helpers

- **Date**: 2026-11-02 00:57
- **Type**: chore
- **Effort**: medium
- **Status**: ready
- **Source**: review finding

## Goal
- `pnpm lint` reports 0 warnings: every `explicit-function-return-type` warning in composables, utils and test helpers is cleared.

## Context
- `eslint.config.mjs:6` — `explicit-function-return-type` is `'warn'` (not `error`); `AGENTS.md:15` documents the warnings as expected.
- Count unverified: `pnpm lint` could not run in the authoring session; the 23 figure comes from the request. Reading found 20 sites below; the other 3 likely sit in unread spec files or components.
- `composables/queries/pokemonQueries.ts` — 14 sites: `:18` `:19` `:20` `:21` `:22` `:23` `:24` `:26` (`pokemonKeys` members), `:86` `:88` (`pokemonDetailQueryOptions` and its `queryFn`), `:92` `:98` `:108` `:111` (`dexNamesQueryOptions`, `usePokemonInfiniteList`, `useDexNames`, `usePokemonDetail`).
- `composables/queries/useTypeIndex.ts` — 1 site: `:8` (`useTypeIndex`).
- `composables/useChapterInk.ts` — 1 site: `:8` (`useChapterInk`).
- `composables/useDexFilter.ts` — 2 sites: `:7` (`useDexFilter`), `:58` (`retry` in returned object).
- `composables/useInView.ts` — 1 site: `:5` (`useInView`, wraps `useIntersectionObserver`).
- `tests/components/PokemonGrid.spec.ts` — 1 site: `:27` (`mountGrid` helper).
- `utils/dex.ts`, `utils/pokemon.ts`, `utils/evolution.ts`, `utils/typeStyles.ts` — already typed by reading, no sites.
- Sibling `/Users/enggaginting/Code/sg208/public/reeeecipe/eslint.config.mjs:6` — same rule at `'warn'`, so not enforced repo-wide there either.
- Sibling `composables/queries/useRecipesQuery.ts:9-12` — `recipeKeys` arrows untyped, so the sibling is not warning-free by reading.
- No prior commit or `.backlog/` item covers this (`git log -i --grep=return` empty; `.backlog/` absent).

## Proposed approach
1. Annotate every flagged site above with an explicit return type (`ReturnType<typeof useQuery<...>>` style, as `reeeecipe` does) · files: `composables/queries/pokemonQueries.ts`, `composables/queries/useTypeIndex.ts`, `composables/useChapterInk.ts`, `composables/useDexFilter.ts`, `composables/useInView.ts`, `tests/components/PokemonGrid.spec.ts` · satisfies: D-1, D-2, D-3
2. Re-run `pnpm lint --max-warnings 0` and clear any remaining sites in specs or components the count missed · files: `tests/**/*.spec.ts`, `components/**` · satisfies: D-1
3. Raise the rule to `'error'` only for `composables/**` and `utils/**` via a flat-config override at `eslint.config.mjs:6` (the mechanical guard against new untyped composables) · files: `eslint.config.mjs` · satisfies: D-4
- Cheaper option: skip step 3 and rely on `pnpm lint` in review; leaves new untyped composables as warnings.

## Done when
| id | check | expect |
|---|---|---|
| D-1 | `pnpm lint --max-warnings 0` | exit 0 · 0 warnings |
| D-2 | `pnpm type-check` | exit 0 |
| D-3 | `pnpm test` | exit 0 |
| D-4 | `grep -c "explicit-function-return-type" eslint.config.mjs` | match count 2 (base `warn` line plus `composables/utils` `error` override) |

## Open questions
- none

## Also spotted
- `composables/queries/useRecipesQuery.ts` — sibling repo `reeeecipe`, not this repo; out of scope here.
