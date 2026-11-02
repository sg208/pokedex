<script setup lang="ts">
const { repoUrl } = useAppConfig();
const currentYear = new Date().getFullYear();

const links = [
  { to: '/accessibility', label: 'Accessibility' },
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms', label: 'Terms' },
] as const;

const linkClass =
  'inline-flex min-h-11 items-center underline underline-offset-4 decoration-2';
</script>

<template>
  <footer
    class="site-footer field-coral"
    data-chapter
    data-bg="#ed4b44"
    data-ink="#1a1a1a"
  >
    <h2 class="sr-only">About this site</h2>

    <div class="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
      <p class="font-extrabold">Pokédex</p>
      <p class="max-w-[40ch]">
        A free, open-source Pokédex of all 1,025 Pokémon, built on PokeAPI.
      </p>
      <a href="#top" :class="linkClass">Back to top</a>
    </div>

    <div>
      <div
        class="grid gap-x-6 gap-y-1 md:grid-cols-[1fr_auto_1fr] md:items-center"
      >
        <nav aria-label="Footer">
          <ul class="flex flex-wrap gap-x-6">
            <li v-for="link in links" :key="link.to">
              <NuxtLink :to="link.to" :class="linkClass">
                {{ link.label }}
              </NuxtLink>
            </li>
            <li>
              <a
                :href="repoUrl"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Source code on GitHub (opens in a new tab)"
                class="inline-flex size-11 items-center justify-center opacity-75 hover:opacity-100 focus-visible:opacity-100"
              >
                <svg
                  viewBox="0 0 16 16"
                  width="20"
                  height="20"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                  />
                </svg>
              </a>
            </li>
          </ul>
        </nav>
        <p>
          MIT licence. Made by Syailendra Ginting
        </p>
        <p class="md:text-right">© {{ currentYear }}</p>
      </div>

      <p class="mt-6 max-w-[60ch]">
        Pokémon and Pokémon character names are trademarks of Nintendo,
        Creatures Inc. and GAME FREAK. Data and artwork from PokeAPI. Not
        affiliated.
      </p>
    </div>
  </footer>
</template>
