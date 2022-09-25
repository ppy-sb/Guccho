<template>
  <div v-show="!isLoading">
    <t-modal-container :teleport-id="config.appModalTeleportTargetId">
      <div v-show="!isLoading" class="flex flex-col min-h-screen overflow-y-hidden bg-kimberly-50 dark:bg-kimberly-800 drop-shadow-xl">
        <div class="flex flex-col overflow-auto min-h-screen">
          <NavbarDefault />
          <div class="flex-grow flex flex-col">
            <slot />
          </div>
          <footer class="py-4 text-center bottom-1 bg-kimberly-200 dark:bg-kimberly-900">
            <h1 class="text-sm font-semibold text-kimberly-900 dark:text-kimberly-100">
              © {{ new Date().getFullYear() }} ppy.sb | Varkaria
            </h1>
            <h2 class="text-sm font-semibold font-bold text-kimberly-900 dark:text-kimberly-100">
              <span class="text-green-400">API</span> {{ config.version.api }}
              <span class="text-yellow-400">FRONT</span> {{ config.version.front }}
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppConfig } from '#app'

const isLoading = ref(true)
const config = useAppConfig()
onMounted(() => {
  isLoading.value = false
})
const colorMode = useColorMode()

</script>
