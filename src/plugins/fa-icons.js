import { config } from '@fortawesome/fontawesome-svg-core'
// we got this. Weird type error thingy
// eslint-disable-next-line import/named
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// import { fas } from '@fortawesome/free-solid-svg-icons'

// This is important, we are going to let Nuxt worry about the CSS
config.autoAddCss = false

// You can add your icons directly in this plugin. See other examples for how you
// can add other styles or just individual icons.
// addToLibrary(fas)

export default defineNuxtPlugin((_nuxtApp) => {
  // _nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})
