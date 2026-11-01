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

    <div class="footer-fit">
      <a href="https://github.com/sg208" class="footer-display display">
        github.com/sg208
      </a>

      <div
        class="mt-10 grid gap-x-6 gap-y-1 md:grid-cols-[1fr_auto_1fr] md:items-center"
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
                :class="linkClass"
              >
                Source on GitHub
                <span class="sr-only">(opens GitHub in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>
        <p>
          MIT licence. Made by
          <a
            href="https://github.com/sg208"
            class="underline underline-offset-4 decoration-2"
            >Syailendra Ginting</a
          >
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
