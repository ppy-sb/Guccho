<script lang="ts" setup>
const safari = shallowRef(false)

const scrollY = useScrollYObserver()

const scroll = shallowRef<HTMLElement>()
const { status } = useZoomModal()

onMounted(() => {
  safari.value = useSafariDetector()
})
</script>

<template>
  <div>
    <NuxtLoadingIndicator />
    <app-navbar />
    <DevOnly>
      <app-experience />
    </DevOnly>
    <NuxtLayout
      ref="scroll"
      viewport
      :class="[safari ? 'safari' : 'not-safari']"
      class="zoom-modal-container overflow-x-clip"
      :data-l1-status="status"
      data-l2-status="hidden"
      :style="status !== 'closed' && {
        'transform-origin': `center calc(${scrollY} * 1px + 50dvh)`,
      }"
    >
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
@import "~/assets/styles/modal.scss";
$zoom-content-stage1: saturate(0.4);
$zoom-content-stage2: saturate(0.4) opacity(0.2);

$scale: scale(0.98);
$scale2: scale(0.96);

.safari {
  -webkit-overflow-scrolling: touch;
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

    &[data-l2-status="closing"]  {
      animation: zoomInModalContentL2 $duration $animate-function forwards;
    }

  }

  &[data-l1-status="closing"] {
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
