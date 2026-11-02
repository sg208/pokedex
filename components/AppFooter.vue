<script setup lang="ts">
const { repoUrl } = useAppConfig();
const currentYear = new Date().getFullYear();

const siteLinks = [
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

    <div class="site-footer__grid">
      <div class="site-footer__brand">
        <p class="site-footer__wordmark display">Pokédex</p>
        <p class="mt-4 max-w-[32ch]">
          A free, open-source Pokédex of all 1,025 Pokémon.
        </p>
      </div>

      <nav class="site-footer__nav" aria-label="Footer">
        <div>
          <h3 class="text-small font-extrabold">Site</h3>
          <ul>
            <li v-for="link in siteLinks" :key="link.to">
              <NuxtLink :to="link.to" :class="linkClass">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <h3 class="text-small font-extrabold">Project</h3>
          <ul>
            <li>
              <a
                :href="repoUrl"
                target="_blank"
                rel="noopener noreferrer"
                :class="linkClass"
              >
                Source on GitHub
                <span class="sr-only">(opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a
                href="https://pokeapi.co"
                target="_blank"
                rel="noopener noreferrer"
                :class="linkClass"
              >
                Data and artwork from PokeAPI
                <span class="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div class="site-footer__legal text-small">
        <p>© {{ currentYear }} Syailendra Ginting. MIT licence.</p>
        <p class="mt-2 max-w-[60ch]">
          Pokémon and Pokémon character names are trademarks of Nintendo,
          Creatures Inc. and GAME FREAK. Not affiliated.
        </p>
      </div>

      <a href="#top" :class="[linkClass, 'site-footer__top text-small']">
        Back to top
      </a>
    </div>
  </footer>
</template>
