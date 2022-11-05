<template>
  <div
    :class="[
      safari ? 'safari' :'not-safari',
      { 'has-bg': props.hasBg }
    ]"
    class="screen"
  >
    <app-navbar :disabled="modalContainer?.stat === 1" />
    <app-experience class="z-50" />
    <t-modal-container ref="modalContainer" :teleport-id="config.appModalTeleportTargetId">
      <!-- bg-kimberly-50 dark:bg-kimberly-800 -->
      <div class="flex flex-col min-h-screen overflow-y-hidden">
        <div class="flex flex-col min-h-screen overflow-auto">
          <div class="flex flex-col flex-grow">
            <slot />
          </div>
          <slot name="footer" />
        </div>
      </div>
    </t-modal-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppConfig } from '#app'
import { useSafariDetector } from '#imports'
const safari = ref(true)
const modalContainer = ref()

const props = withDefaults(defineProps<{
  hasBg: boolean
}>(), {
  hasBg: true
})

const config = useAppConfig()
onMounted(() => {
  safari.value = useSafariDetector()
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
