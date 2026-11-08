<script setup lang="ts">
const { repoUrl } = useAppConfig();
const issuesUrl = `${repoUrl}/issues`;

useHead({
  title: 'Privacy - Pokédex',
  meta: [
    {
      name: 'description',
      content:
        'This site sets no cookies, has no tracking and stores nothing in your browser.',
    },
  ],
});
</script>

<template>
  <LegalPage
    title="Privacy"
    lead="This site does not collect anything about you. It has no accounts, no cookies and no tracking."
  >
    <h2>What stays on your device</h2>
    <p>
      No cookies. Nothing is saved in your browser's storage. Your searches and
      filters are forgotten when you close the page.
    </p>

    <h2>Who your browser talks to</h2>
    <p>
      The page loads its data and pictures straight from these services, so they
      can see your IP address, as with any website:
    </p>
    <ul>
      <li>
        pokeapi.co supplies the Pokémon names, types, stats and evolutions.
      </li>
      <li>raw.githubusercontent.com supplies the official artwork pictures.</li>
      <li>Cloudflare hosts this site and delivers its files.</li>
    </ul>
    <p>Fonts and icons are served from this site, not from a third party.</p>

    <h2>Tracking</h2>
    <p>
      There is no tracking: no visitor counting, no advertising and no
      fingerprinting.
    </p>

    <h2>Questions</h2>
    <p>
      Open an issue on
      <a :href="issuesUrl">GitHub</a> and the author will reply there.
    </p>
  </LegalPage>
</template>
