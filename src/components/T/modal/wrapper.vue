<script setup lang="ts">
export type Status = 'hidden' | 'show' | 'closed'

const props = defineProps<{
  initStatus?: Status
}>()
const wrapper = shallowRef(null)
// const status = shallowRef(0)
const openModalContainer = inject<(cb?: () => void) => void>('openModal')
const closeModalContainer = inject<(cb?: () => void) => void>('closeModal')
const stat = shallowRef(props.initStatus || 'hidden')

function openModal(cb?: () => void) {
  stat.value = 'show'
  openModalContainer?.(cb)
}
function closeModal(cb?: () => void) {
  stat.value = 'closed'
  closeModalContainer?.(cb)
}
defineExpose({
  openModal,
  closeModal,
  wrapper,
})
</script>

<template>
  <div ref="wrapper" class="zoom-modal-wrapper" :data-wrapper-status="stat">
    <div class="zoom-modal">
      <slot v-bind="{ openModal, closeModal }" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.zoom-modal-wrapper {
  & .zoom-modal-wrapper {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }

  img {
    pointer-events: none;
  }

  &[data-wrapper-status="show"] {
    img {
      pointer-events: all;
    }
  }
}
</style>

<style lang="scss">
@import "./shared.scss";

$in: blur(0.5em) opacity(0) saturate(0.5);
.zoom-modal-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  &[data-wrapper-status="hidden"] {
    visibility: hidden;
    z-index: 0;
    pointer-events: none;
  }
  &[data-wrapper-status="show"] {
    z-index: 50;

    > .zoom-modal {
      animation: zoomIn $duration $animate-function forwards;
    }
  }

  &[data-wrapper-status="closed"] {
    > .zoom-modal {
      animation: zoomOut $duration $animate-function forwards;
    }
  }
}

@keyframes zoomIn {
  0% {
    transform: scale(0.96);
    filter: $in;
  }

  100% {
    transform: scale(1);
  }
}

@keyframes zoomOut {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(0.93);
    filter: $in;
  }
}
</style>
