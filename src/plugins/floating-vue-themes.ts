import floatingVue from 'floating-vue'

const { options } = floatingVue

export default defineNuxtPlugin(() => {
  options.themes['guweb-dropdown'] = {
    $extend: 'dropdown',
    $resetCss: true,
    autoHide: true,
  }
})
