# Deployment

The live site, https://pokedex.engg.app, is a Cloudflare Worker that serves static assets, on the sg208 Cloudflare account. Deploy from `main` only.

## Build

```bash
pnpm install --frozen-lockfile
pnpm generate
```

The output goes to `.output/public`. The build makes one PokeAPI request to list the 1,025 Pokémon names. If PokeAPI is unreachable, the build fails loudly rather than shipping a partial site.

## Deploy

`wrangler.jsonc` points the Worker at `.output/public` and binds it to the `pokedex.engg.app` custom domain.

```bash
pnpm run deploy   # pnpm generate, then wrangler deploy
```

Requirements:

- `wrangler` v4, installed as a dev dependency by `pnpm install`
- `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` set in the environment

## Missing pages

The home page and legal pages are fully prerendered. Each `/pokemon/<name>` is prerendered as an empty client-rendered shell (`ssr: false`) that fetches its data in the browser. Each shell still gets its own title, description and Open Graph tags at build time, from the one names request (`modules/dex-routes.ts`).

Unknown paths get the real `404.html` (`not_found_handling: "404-page"`). A single-page fallback was rejected because Cloudflare would then serve `/index.html` with a 200 status for every path.

## Rollback

- Run `wrangler rollback` to return to the previous version, or redeploy the previous commit from `main`.
- To take the site down, run `wrangler delete --name pokedex` and remove the `pokedex.engg.app` custom domain.

The site is static assets, so there is no data to lose.

## Local check

```bash
pnpm generate
pnpm preview
```

## Troubleshooting

- Dependency errors: delete `node_modules`, run `pnpm install` again, and check that you are on the Node version in `.node-version`.
- `pnpm generate` fails at the start: PokeAPI may be unreachable. Retry once it is back.
- No `.output/public` after `pnpm generate`: look for build errors in the console.
