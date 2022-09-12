import { defineNuxtConfig } from 'nuxt'

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
  css: ['~/assets/main.css'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/varka.js',
    '~/plugins/click-outside.js'
  ],

  publicRuntimeConfig: {
    baseUrl: 'dev.ppy.sb',
    version: {
      api: '1.0.3',
      front: '1.0.3'
    },
    title: 'guweb',
    mode: [
      {
        name: 'Standard',
        icon: 'osu'
      },
      {
        name: 'Taiko',
        icon: 'taiko'
      },
      {
        name: 'Catch',
        icon: 'catch'
      },
      {
        name: 'Mania',
        icon: 'mania'
      }
    ],
    mods: [
      {
        name: 'Vanilla',
        icon: 'vn'
      },
      {
        name: 'Relax',
        icon: 'rx'
      },
      {
        name: 'Autopilot',
        icon: 'ap'
      }
    ]
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: {
    global: true,
    dirs: ['~/components']
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
    '@pinia/nuxt'
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
    baseUrl: process.env.BASE_URL || 'localhost',
    defaultColorTheme: parseInt(process.env.COLOR_THEME_DEFAULT) || 200
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

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
  postcss
})
