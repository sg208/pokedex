<script setup lang="ts">
const { repoUrl } = useAppConfig();
const issuesUrl = `${repoUrl}/issues`;

useHead({
  title: 'Terms - Pokédex',
  meta: [
    {
      name: 'description',
      content:
        'The code is MIT licensed. Pokémon names and artwork belong to their owners.',
    },
  ],
});
</script>

<template>
  <LegalPage
    title="Terms"
    lead="This is a free fan project. The code is open source and the Pokémon belong to their owners."
  >
    <h2>The code</h2>
    <p>
      The source code is released under the MIT licence. You may use, copy and
      change it, as long as you keep the licence notice. It comes with no
      warranty. The full text is in the
      <a :href="`${repoUrl}/blob/main/LICENSE`">LICENSE file</a>.
    </p>

    <h2>Pokémon trademarks and artwork</h2>
    <p>
      Pokémon and Pokémon character names are trademarks of Nintendo, Creatures
      Inc. and GAME FREAK. The artwork and the data come from PokeAPI. This site
      is not affiliated with, endorsed by or sponsored by any of them. The MIT
      licence covers the code only, not their names or artwork.
    </p>

    <h2>Accuracy</h2>
    <p>
      The data is shown as PokeAPI provides it. It can be wrong or out of date,
      so do not rely on it for anything that matters.
    </p>

    <h2>Your data</h2>
    <p>
      See the <NuxtLink to="/privacy">privacy page</NuxtLink>: nothing about you
      is collected.
    </p>

    <h2>Questions</h2>
    <p>Open an issue on <a :href="issuesUrl">GitHub</a>.</p>
  </LegalPage>
</template>
