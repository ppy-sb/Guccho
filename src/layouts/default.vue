<template>
  <div v-show="!isLoading" :class="safari ? 'safari' :'not-safari'" class="screen">
    <app-navbar :disabled="modalContainer?.stat === 1" />
    <t-modal-container ref="modalContainer" :teleport-id="config.appModalTeleportTargetId">
      <!-- bg-kimberly-50 dark:bg-kimberly-800 -->
      <div v-show="!isLoading" class="flex flex-col min-h-screen overflow-y-hidden">
        <div class="flex flex-col overflow-auto min-h-screen">
          <div class="flex-grow flex flex-col">
            <slot />
          </div>
          <footer class="py-4 text-center bottom-1">
            <h3 v-if="safari">
              dev note: some visual effects are disabled for safari to improve performance.
            </h3>
            <h1 class="text-sm font-semibold text-kimberly-900 dark:text-kimberly-100">
              © {{ new Date().getFullYear() }} ppy.sb | Varkaria
            </h1>
            <h2 class="text-sm font-semibold font-bold text-kimberly-900 dark:text-kimberly-100">
              <span class="text-green-700 dark:text-green-400">API</span> {{ config.version.api }}
              <span class="text-yellow-600 dark:text-yellow-400">FRONT</span> {{ config.version.front }}
            </h2>
          </footer>
        </div>
      </div>
    </t-modal-container>

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
          class="w-12 h-12 text-kimberly-900 dark:text-kimberly-100 animate-spin"
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

<script setup>
import { ref, onMounted } from 'vue'
import { useAppConfig } from '#app'

const safari = ref(true)
const isLoading = ref(true)
const modalContainer = ref()

const config = useAppConfig()
onMounted(() => {
  safari.value = useSafariDetector()
  isLoading.value = false
})
// const colorMode = useColorMode()

</script>

<style lang="postcss">
.screen {
  @apply bg-gradient-to-b from-kimberly-50 to-kimberly-150/80 dark:from-kimberly-800 dark:to-kimberly-900
}
.not-safari {
  & .custom-container {
    @apply drop-shadow-xl
  }
}
</style>
