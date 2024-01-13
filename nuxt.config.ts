import { fileURLToPath } from 'node:url'
import { pick } from 'lodash-es'
import PackageJSON from './package.json'
import backend from './guccho.backend.config'
import ui from './guccho.ui.config'
import './scripts/ensure-env'
import { Lang } from './src/def'
import { CountryCode } from './src/def/country-code'

const uiConf = pick(ui, ['baseUrl', 'brand', 'footerLink', 'iconLinks', 'leaderboardRankingSystem'])

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
    'floating-vue/nuxt',
  ],

  alias: {
    $active: fileURLToPath(new URL(`./src/server/backend/${backend.use}`, import.meta.url)),
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
    '~/components/content/styles/typography.scss',
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
  runtimeConfig: {
    public: { version: PackageJSON.version, ...uiConf },
  },
  watch: [
    /\.\/guccho.(ui|backend).config.ts/,
    './daisyui.themes.ts',
    './tailwind.config.ts',
  ],

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
    componentIslands: true,
    // viewTransition: true,
    // asyncContext: true,
    renderJsonPayloads: true,
    headNext: true,
    inlineRouteRules: true,
    typedPages: true,
  },

  devtools: {
    timeline: {
      enabled: true,
    },
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
})
