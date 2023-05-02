<script lang="ts" setup>
const safari = shallowRef(false)
const modalContainer = shallowRef()

const [_, setScroll] = useScrollYObserver()

const scroll = shallowRef<HTMLElement>()
const { status } = useZoomModal()

onMounted(() => {
  safari.value = useSafariDetector()
  scroll.value && setScroll(scroll.value)
})
</script>

<template>
  <div
    ref="scroll"
    :class="[safari ? 'safari' : 'not-safari']"
    class="overflow-x-hidden overflow-y-auto zoom-modal-container"
    :data-l1-status="status"
    data-l2-status="hidden"
  >
    <teleport to="body">
      <app-navbar :disabled="modalContainer?.stat === 'show'" />
      <DevOnly>
        <app-experience />
      </DevOnly>
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
    <div
      id="footer" class="relative" :class="{
        disabled: modalContainer?.stat === 'show',
      }"
    />
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

<style lang="scss">
@import "~/assets/styles/modal.scss";
$zoom-content-stage1: opacity(0.4) saturate(0.7);
$zoom-content-stage2: opacity(0.2) saturate(0.3);

$scale: scale(0.98);
$scale2: scale(0.96);

.safari {
  .notify-safari-something-will-change {
    will-change: transform, filter;
  }
}

.zoom-modal-container {

  &[data-l1-status="show"] {

    &[data-l2-status="hidden"]  {
      animation: zoomOutModalContent $duration $animate-function forwards;
    }

    &[data-l2-status="show"] {
      animation: zoomOutModalContentL2 $duration $animate-function forwards !important;
    }

    &[data-l2-status="closed"]  {
      animation: zoomInModalContentL2 $duration $animate-function forwards;
    }

  }

  &[data-l1-status="closed"] {
    animation: zoomInModalContent $duration $animate-function forwards;
  }
}

@keyframes zoomOutModalContent {
  0% {
    transform: scale(1);
  }

  100% {
    transform: $scale;
    filter: $zoom-content-stage1;
  }
}

@keyframes zoomInModalContent {
  0% {
    transform: $scale;
    filter: $zoom-content-stage1;
  }

  100% {
    transform: scale(1);
  }
}

@keyframes zoomOutModalContentL2 {
  0% {
    transform: $scale;
    filter: $zoom-content-stage1;
  }

  100% {
    transform: $scale2;
    filter: $zoom-content-stage2;
  }
}

@keyframes zoomInModalContentL2 {
  0% {
    transform: $scale2;
    filter: $zoom-content-stage2;
  }

  100% {
    transform: $scale;
    filter: $zoom-content-stage1;
  }
}

.zoom-modal-container[data-l2-status="show"] > dialog::backdrop {
  z-index: 1000 !important;
}
</style>
