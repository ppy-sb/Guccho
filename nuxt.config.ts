import { env } from 'node:process'
import { fileURLToPath } from 'node:url'
import './scripts/ensure-env'
import { Lang } from './src/def'
import { CountryCode } from './src/def/country-code'

export default defineNuxtConfig({
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: true,

  srcDir: 'src/',

  build: {
    transpile: ['trpc-nuxt'],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/styles/main.scss',
    '~/assets/styles/transitions.scss',
    '~/assets/styles/daisyui.scss',
    '~/assets/styles/popper.scss',
  ],

  app: {
    pageTransition: {
      name: 'slide',
      mode: 'out-in',
    },
    layoutTransition: {
      name: 'slide',
      mode: 'out-in', // default
    },
  },

  experimental: {
    // viewTransition: true,
    renderJsonPayloads: true,
    componentIslands: true,
  },

  vite: {
    build: {
      minify: true,
      sourcemap: 'inline',
    },
  },
  vue: {
    defineModel: true,
  },

  modules: [
    // '@nuxtjs/color-mode',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/image',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',
    'nuxt-icon',
    'nuxt-typed-router',
  ],

  alias: {
    $active: fileURLToPath(new URL(`./src/server/backend/${env.BACKEND}`, import.meta.url)),
    $base: fileURLToPath(new URL('./src/server/backend/$base', import.meta.url)),
  },

  typescript: {
    strict: true,
  },

  devtools: {
    timeline: {
      enabled: true,
    },
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: Lang.enGB,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'g-lang',
      redirectOn: 'root', // recommended
    },
    locales: [
      {
        code: Lang.enGB,
        flag: CountryCode.UnitedKingdom,
        name: 'English (International)',
      },
      {
        code: Lang.frFR,
        flag: CountryCode.France,
        name: 'French (France)',
      },
      {
        code: Lang.zhCN,
        flag: CountryCode.China,
        name: '简体中文 (中国)',
      },
    ],
  },
})
