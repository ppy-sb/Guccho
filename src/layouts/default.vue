<script lang="ts" setup>
const safari = shallowRef(false)
const modalContainer = shallowRef()

const config = useAppConfig()
const [_, setScroll] = useScrollYObserver()

const scroll = shallowRef<HTMLElement>()

onMounted(() => {
  safari.value = useSafariDetector()
  nextTick(() => {
    scroll.value && setScroll(scroll.value)
  })
})
</script>

<template>
  <div ref="scroll" :class="[safari ? 'safari' : 'not-safari']" class="overflow-hidden overflow-y-auto">
    <t-modal-container
      ref="modalContainer"
      :teleport-id="config.appModalTeleportTargetId"
    >
      <teleport to="body">
        <app-navbar :disabled="modalContainer?.stat === 'show'" />
      </teleport>

      <div class="h-[100dvh]" viewport>
        <div class="flex flex-col min-h-full flex-grow">
          <slot />
          <slot name="footer">
            <footer class="py-4 text-center relative">
              <h1
                class="text-sm font-semibold text-gbase-900 dark:text-gbase-100"
              >
                © {{ new Date().getFullYear() }} ppy.sb | Varkaria
              </h1>
            </footer>
          </slot>
        </div>
      </div>
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

<style scoped>
[viewport] {
  -webkit-overflow-scrolling: touch;
  /* overscroll-behavior: none; */
}
</style>

<style lang="postcss">
#footer.disabled {
  @apply blur-sm
}
</style>
