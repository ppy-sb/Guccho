import { defineNuxtConfig } from 'nuxt/config'

import postcss from './postcss.config'
export default defineNuxtConfig({
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: true,

  srcDir: 'src/',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'guweb-nuxt',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/styles/main.scss',
    '~/assets/styles/daisyui.scss',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],

  colorMode: {
    classSuffix: ''
  },

  publicRuntimeConfig: require('./public.config.js'),

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: {
    global: true,
    dirs: ['~/components']
  },

  nitro: {
    minify: true
  },
  vite: {
    build: {
      minify: true
    }
  },

  trpc: {
    baseURL: '', // Set empty string (default) to make requests by relative address
    endpoint: '/trpc' // defaults to /trpc
  },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    'floating-vue/nuxt'
    // https://go.nuxtjs.dev/eslint
    // '@nuxtjs/eslint-module',
    // // https://animejs.com/
    // 'nuxt-animejs'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/tailwindcss',
    // https://go.nuxtjs.dev/pwa
    // '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    // '@nuxt/content',
    // '@nuxtjs/auth-next',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    'trpc-nuxt'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/'
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  env: {
    baseUrl: process.env.BASE_URL || 'localhost'
  },

  auth: {
    strategies: {
      local: {
        token: {
          property: 'access_token',
          global: true,
          required: true,
          maxAge: 60 * 60,
          type: 'Bearer'
        },
        user: {
          property: '',
          autoFetch: true
        },
        endpoints: {
          login: { url: 'http://localhost:3001/v1/auth/token', method: 'post' },
          logout: false,
          user: { url: 'http://localhost:3001/v1/auth/user/me', method: 'get' }
        }
      }
    }
  },
  postcss,
  vue: {
    config: {
      productionTip: true,
      devtools: false
    }
  },
  typescript: {
    strict: true
  }
})
