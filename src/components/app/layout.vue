<template>
  <div
    v-show="!isLoading"
    :class="[
      safari ? 'safari' :'not-safari',
      { 'has-bg': props.hasBg }
    ]"
    class="screen"
  >
    <app-navbar :disabled="modalContainer?.stat === 1" />
    <t-modal-container ref="modalContainer" :teleport-id="config.appModalTeleportTargetId">
      <!-- bg-kimberly-50 dark:bg-kimberly-800 -->
      <div v-show="!isLoading" class="flex flex-col min-h-screen overflow-y-hidden">
        <div class="flex flex-col min-h-screen overflow-auto">
          <div class="flex flex-col flex-grow">
            <slot />
          </div>
          <slot name="footer" />
        </div>
      </div>
    </t-modal-container>

    <transition
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-show="isLoading"
        id="loading-screen"
        class="absolute top-0 flex items-center justify-center w-screen h-screen"
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
import { useSafariDetector } from '#imports'
const safari = ref(true)
const isLoading = ref(true)
const modalContainer = ref()

const props = withDefaults(defineProps<{
  hasBg: boolean
}>(), {
  hasBg: true
})

const config = useAppConfig()
onMounted(() => {
  safari.value = useSafariDetector()
  isLoading.value = false
})
// const colorMode = useColorMode()

</script>

<style lang="postcss">
.screen.has-bg {
  @apply bg-gradient-to-b from-kimberly-50 to-kimberly-150/80 dark:from-kimberly-800 dark:to-kimberly-900
}
.not-safari {
  & .custom-container {
    @apply drop-shadow-xl
  }
}
</style>
