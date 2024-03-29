import floatingVue from 'floating-vue'

export default defineNuxtPlugin(() => {
  const { options } = floatingVue

  options.themes['guccho-dropdown'] = {
    $extend: 'dropdown',
    $resetCss: true,
    autoHide: true,
  }
  options.themes['guccho-dropdown-b'] = {
    $extend: 'dropdown',
    $resetCss: true,
    autoHide: true,
  }
})
