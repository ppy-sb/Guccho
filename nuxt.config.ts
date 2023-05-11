import { fileURLToPath } from 'node:url'
import postcss from './postcss.config'

import './scripts/ensure-env'

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
    '@fortawesome/fontawesome-svg-core/styles.css',
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

  nitro: {
    minify: true,
  },

  vite: {
    build: {
      minify: true,
      sourcemap: 'inline',
    },
  },

  modules: [
    // '@nuxtjs/color-mode',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-icon',
  ],

  alias: {
    $active: fileURLToPath(new URL(`./src/server/backend/${process.env.BACKEND}`, import.meta.url)),
    $def: fileURLToPath(new URL('./src/server/backend/@base', import.meta.url)),
    $articles: fileURLToPath(new URL('./articles', import.meta.url)),
  },

  postcss,

  typescript: {
    strict: true,
  },
  imports: {
  },

  // @ts-expect-error typedef is wrong
  devtools: true,
})
