export const state = () => ({
  theme_hue: process.env.defaultColorTheme
})

export const mutations = {
  changeThemeHue (state, hue) {
    state.theme_hue = hue
  }
}
