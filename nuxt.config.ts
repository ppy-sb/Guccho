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

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/image',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',
    'nuxt-icon',
  ],

  alias: {
    $active: fileURLToPath(new URL(`./src/server/backend/${env.BACKEND}`, import.meta.url)),
    $base: fileURLToPath(new URL('./src/server/backend/$base', import.meta.url)),
  },

  vite: {
  },

  vue: {
    defineModel: true,
  },

  typescript: {
    strict: true,
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
    head: {
      meta: [
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      bodyAttrs: {
        // @ts-expect-error it's fine
        tabindex: '-1',
      },
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

  experimental: {
    // viewTransition: true,
    asyncContext: true,
    headNext: true,
    inlineRouteRules: true,
    typedPages: true,
    typescriptBundlerResolution: true,
  },

  devtools: {
    timeline: {
      enabled: true,
    },
  },

})
