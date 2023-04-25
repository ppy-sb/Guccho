import floatingVue from 'floating-vue'

const { options } = floatingVue

options.themes['guweb-dropdown'] = {
  $extend: 'dropdown',
  $resetCss: true,
  autoHide: true,
}
options.themes['guweb-dropdown-b'] = {
  $extend: 'dropdown',
  $resetCss: true,
  autoHide: true,
}
export default defineNuxtPlugin(() => {
})
