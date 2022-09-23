<template>
  <div v-show="!isLoading" data-theme="guweb">
    <t-modal-container teleport-id="app-modal-portal">
      <div v-show="!isLoading" class="flex flex-col h-screen overflow-y-hidden bg-ebony-clay-900">
        <div class="flex flex-col flex-1 w-full overflow-auto">
          <NavbarDefault />
          <div class="flex-grow">
            <slot />
          </div>
          <footer class="py-4 text-center bottom-1 bg-ebony-clay-800">
            <h1 class="text-sm font-semibold text-white">
              © {{ new Date().getFullYear() }} ppy.sb | Varkaria
            </h1>
            <h2 class="text-sm font-semibold font-bold text-white">
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppConfig } from '#app'

const isLoading = ref(true)

const config = useAppConfig()
onMounted(() => {
  isLoading.value = false
})
</script>
