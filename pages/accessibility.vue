<script setup lang="ts">
const { repoUrl } = useAppConfig();
const issuesUrl = `${repoUrl}/issues`;

useHead({
  title: 'Accessibility - Pokédex',
  meta: [
    {
      name: 'description',
      content:
        'This site aims to meet WCAG 2.2 level AA and works with a keyboard.',
    },
  ],
});
</script>

<template>
  <LegalPage
    title="Accessibility"
    lead="This site aims to meet WCAG 2.2 level AA. Everyone should be able to look up a Pokémon."
  >
    <h2>What is in place</h2>
    <ul>
      <li>
        Every control works with a keyboard, with a thick visible focus ring.
      </li>
      <li>A skip link jumps past the header to the main content.</li>
      <li>
        Text and controls have enough contrast against their colour fields.
      </li>
      <li>Stats are shown as numbers as well as bars.</li>
      <li>Each picture has a text alternative, the Pokémon's name.</li>
      <li>
        Animation stops if your device asks for reduced motion, and the content
        shows without it.
      </li>
    </ul>

    <h2>Known limits</h2>
    <p>
      Pokémon descriptions and names are in English only. The data comes from a
      third party, so a name may differ from the one you know.
    </p>

    <h2>Last review</h2>
    <p>The author last checked this page on 2 November 2026.</p>

    <h2>Tell us about a barrier</h2>
    <p>
      If something does not work for you, open an issue on
      <a :href="issuesUrl">GitHub</a>. Say which page and which tool you used.
    </p>
  </LegalPage>
</template>
