export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  srcDir: 'client/',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'guweb-nuxy',
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
    '~/plugins/tooltip.js',
    '~/plugins/click-outside.js'
  ],

  publicRuntimeConfig: {
    version: {
      api: '1.0.0',
      front: '1.0.1'
    }
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://windicss.org/
    'nuxt-windicss',
    // https://animejs.com/
    'nuxt-animejs'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    '@nuxt/content',
    '@nuxtjs/auth-next',
    ['nuxt-tailvue', {
      all: true,
      toast: {
        defaultProps: {
          timeout: 10,
          progress: true,
          classToast: 'bg-gray-700',
          classTitle: 'text-gray-100',
          classMessage: 'text-gray-200',
          classClose: 'text-gray-300',
          classTimeout: 'bg-gray-800'
        }
      }
    }]
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

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
