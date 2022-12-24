<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAppConfig } from '#app'
import { useSafariDetector } from '#imports'
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
    ]"
  >
    <app-experience class="z-50" />
    <t-modal-container ref="modalContainer" :teleport-id="config.appModalTeleportTargetId">
      <teleport to="body">
        <app-navbar :disabled="modalContainer?.stat === 'show'" />
      </teleport>

      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </t-modal-container>
  </div>
</template>

<style lang="postcss">
.not-safari {
  & .custom-container {
    @apply drop-shadow-xl
  }
}
</style>
