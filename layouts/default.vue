<template>
  <div v-show="!isLoading">
    <transition
      enter-active-class="transition duration-200 ease-out delay-200"
      enter-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <div v-show="!isLoading" class="flex flex-col h-screen overflow-y-hidden bg-hsl-b6" :style="`--base-h: ${$store.state.theme_hue}`">
        <div id="app" class="flex flex-col flex-1 w-full overflow-y-auto bg-dark-5">
          <NavbarDefault />
          <div class="flex-grow">
            <div id="main">
              <Nuxt />
            </div>
          </div>
          <footer class="py-4 text-center bottom-1 bg-hsl-b5">
            <h1 class="text-sm font-semibold text-white">
              © 2022 Varkaria
            </h1>
            <h2 class="text-sm font-semibold font-bold text-white">
              <span class="text-green-400">API</span> {{ $config.version.api }}
              <span class="text-yellow-400">FRONT</span> {{ $config.version.front }}
            </h2>
          </footer>
        </div>
      </div>
    </transition>

    <transition
      leave-active-class="transition ease-in duration-200"
      leave-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-show="isLoading"
        id="loading-screen"
        class="absolute top-0 flex items-center justify-center w-screen h-screen z-60"
      >
        <svg
          class="w-12 h-12 text-white animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data () {
    return {
      isLoading: true
    }
  },
  watch: {
    $route () {
      if (this.$store.state.theme_hue !== process.env.defaultColorTheme) {
        return this.$store.commit('changeThemeHue', process.env.defaultColorTheme)
      }
    }
  },
  mounted () {
    this.isLoading = false
  }
  // ...
}
</script>
