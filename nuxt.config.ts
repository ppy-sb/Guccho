import { fileURLToPath } from 'url'

import hljs from './configs/hljs'

import postcss from './postcss.config'
export default defineNuxtConfig({
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: true,

  srcDir: 'src/',

  build: {
    transpile: ['trpc-nuxt'],
  },

  // Global page headers: https://go.nuxtjs.dev/config-head
  // head: {
  //   title: 'guweb-nuxt',
  //   meta: [
  //     { charset: 'utf-8' },
  //     { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  //     { hid: 'description', name: 'description', content: '' },
  //     { name: 'format-detection', content: 'telephone=no' }
  //   ],
  //   link: [
  //     { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  //   ]
  // },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/styles/main.scss',
    '~/assets/styles/daisyui.scss',
    '~/assets/styles/popper.scss',
    '@fortawesome/fontawesome-svg-core/styles.css',
  ],

  runtimeConfig: { public: { hljs } },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: {
    global: true,
    dirs: ['~/components'],
  },

  nitro: {
    minify: true,
  },
  vite: {
    build: {
      minify: true,
    },
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // '@nuxtjs/auth-next',
    // '@nuxtjs/color-mode',
    // 'floating-vue/nuxt',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  alias: {
    $active: fileURLToPath(new URL('./src/adapters/ppy.sb@bancho.py', import.meta.url)),
    $def: fileURLToPath(new URL('./src/adapters/base', import.meta.url)),
  },

  // auth: {
  //   strategies: {
  //     local: {
  //       token: {
  //         property: 'access_token',
  //         global: true,
  //         required: true,
  //         maxAge: 60 * 60,
  //         type: 'Bearer'
  //       },
  //       user: {
  //         property: '',
  //         autoFetch: true
  //       },
  //       endpoints: {
  //         login: { url: 'http://localhost:3001/v1/auth/token', method: 'post' },
  //         logout: false,
  //         user: { url: 'http://localhost:3001/v1/auth/user/me', method: 'get' }
  //       }
  //     }
  //   }
  // },
  postcss,
  typescript: {
    strict: true,
  },
})
