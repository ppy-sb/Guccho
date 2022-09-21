import { Roller, RollerItem } from 'vue-roller'
import 'vue-roller/dist/style.css'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Roller', Roller)
  nuxtApp.vueApp.component('RollerItem', RollerItem)
})
