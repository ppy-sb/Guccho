<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAppConfig } from '#app'
import { useSafariDetector } from '#imports'
const props = withDefaults(defineProps<{
  hasBg: boolean
}>(), {
  hasBg: true,
})
const safari = ref(true)
const modalContainer = ref()

const config = useAppConfig()
onMounted(() => {
  safari.value = useSafariDetector()
})
// const colorMode = useColorMode()
</script>

<template>
  <div
    :class="[
      safari ? 'safari' : 'not-safari',
      { 'has-bg': props.hasBg },
    ]" class="screen"
  >
    <app-navbar :disabled="modalContainer?.stat === 'show'" />
    <app-experience class="z-50" />
    <t-modal-container ref="modalContainer" :teleport-id="config.appModalTeleportTargetId">
      <!-- bg-kimberly-50 dark:bg-kimberly-800 -->
      <div class="flex flex-col overflow-y-hidden">
        <div class="flex flex-col min-h-screen overflow-auto">
          <div class="flex flex-col flex-grow">
            <slot />
          </div>
          <slot v-if="hasBg" name="footer" />
        </div>
      </div>
    </t-modal-container>
  </div>
</template>

<style lang="postcss">
.screen {
  &.has-bg:before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    @apply bg-gradient-to-b from-kimberly-50/50 to-kimberly-50/90 dark:from-kimberly-800 dark:to-kimberly-900
  }
}

.not-safari {
  & .custom-container {
    @apply drop-shadow-xl
  }
}
</style>
