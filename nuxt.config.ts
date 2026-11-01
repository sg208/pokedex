// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  modules: ['@nuxt/ui', '@nuxt/icon', '@nuxt/eslint', './modules/dex-routes'],

  // Detail pages are client-rendered shells; data loads in the browser
  routeRules: {
    '/pokemon/**': { ssr: false },
  },

  // Fonts are self-hosted via @fontsource-variable (wdth + wght axes), so stop
  // @nuxt/ui from registering @nuxt/fonts and its remote providers
  // One light theme with no colour-mode module: it would write to localStorage,
  // and the privacy page promises nothing is stored
  ui: {
    fonts: false,
    colorMode: false,
  },

  css: ['@fontsource-variable/tiktok-sans/wdth.css', '~/assets/css/main.css'],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  vite: {
    build: {
      sourcemap: false,
    },
  },

  // Never ask api.iconify.design at runtime; add every icon used here
  icon: {
    provider: 'none',
    clientBundle: {
      icons: [],
    },
  },

  // Server-render 404.html with error.vue instead of an empty SPA shell
  experimental: {
    prerenderErrorPages: true,
  },

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/', '/privacy', '/terms', '/accessibility'],
    },
  },
});
