<script setup lang="ts">
// const appConfig = useAppConfig()
const safari = shallowRef(false)
const modalContainer = shallowRef()

const oneYearLater = new Date()
oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)

// const confirmed = useCookie('confirmed-website', {
//   expires: oneYearLater,
// })

// const confirmedWebsite = computed(() => confirmed.value === 'ok')

// const checked = shallowRef(false)

const config = useAppConfig()
onMounted(() => {
  safari.value = useSafariDetector()
})
// const colorMode = useColorMode()
</script>

<template>
  <div :class="[safari ? 'safari' : 'not-safari']" class="overflow-hidden overflow-y-auto">
    <t-modal-container
      ref="modalContainer"
      :teleport-id="config.appModalTeleportTargetId"
    >
      <teleport to="body">
        <app-navbar :disabled="modalContainer?.stat === 'show'" />
      </teleport>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </t-modal-container>
    <div
      id="footer" class="relative" :class="{
        disabled: modalContainer?.stat === 'show',
      }"
    />
    <DevOnly>
      <app-experience />
    </DevOnly>
  </div>
</template>

<style lang="postcss">
#footer.disabled {
  @apply blur-sm
}
</style>
