# Learnings

- PURPOSE: recurring mistakes + non-obvious fixes, cross-session
- APPEND: `/enggflo-init "<mistake>"` when a mistake repeats or a non-obvious fix is found
- SKIP: one-off bugs that won't recur

## 2026-11-02 — taste-inspect-served-build
- Mistake: `inspect.mjs .output/public/index.html` rendered Times/Arial and reported fake FAILs (eyebrow, edge-text, still-page)
- Root cause: `nuxt generate` emits root-absolute `/_nuxt/` asset URLs; the inspector's file server does not resolve them, so CSS and fonts never load
- Fix: serve the build (`npx serve@14.2.4 .output/public -l 4310`) and run `inspect.mjs http://localhost:4310/`
- Rule: run taste-skill `inspect.mjs` against a served build URL, NEVER the generated `index.html` path · enforced_by: unverified
- Source: `.taste-skill/inspect/report.json` (first run, typefaces Times 89%)
