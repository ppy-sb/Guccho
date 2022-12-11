import { options } from 'floating-vue'

export default defineNuxtPlugin(() => {
  options.themes['guweb-dropdown'] = {
    $extend: 'dropdown',
    $resetCss: true,
    autoHide: true,
  }
})
