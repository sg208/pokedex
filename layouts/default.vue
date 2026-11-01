<template>
  <div id="top" class="flex min-h-svh flex-col">
    <a
      href="#main"
      class="sr-only bg-ink px-4 py-3 font-bold text-ground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
    >
      Skip to content
    </a>
    <AppHeader />
    <main id="main" tabindex="-1" class="flex-1 focus:outline-none">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
