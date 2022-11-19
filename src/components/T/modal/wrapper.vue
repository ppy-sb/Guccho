<template>
  <div
    ref="wrapper"
    class="zoom-modal-wrapper"
    :data-wrapper-status="stat"
  >
    <div class="zoom-modal">
      <slot v-bind="{openModal, closeModal}" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import type { Status } from './shared'
const props = defineProps<{
  initStatus?: Status
}>()
const wrapper = ref(null)
// const status = ref(0)
const openModalContainer = inject<() => void>('openModal')
const closeModalContainer = inject<() => void>('closeModal')
const stat = ref(props.initStatus || 'hidden')

const openModal = () => {
  stat.value = 'show'
  openModalContainer?.()
}
const closeModal = () => {
  stat.value = 'closed'
  closeModalContainer?.()
}
defineExpose({
  openModal,
  closeModal,
  wrapper
})
</script>
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
@import './shared.scss';

$in: blur(16px) opacity(0) saturate(0.5);
$scale: scale(1.1);
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

    >.zoom-modal {
      animation: zoomIn $duration $animate-function forwards;
    }
  }

  &[data-wrapper-status="closed"]{
    >.zoom-modal {
      animation: zoomOut $duration $animate-function forwards;
    }
  }
}

@keyframes zoomIn {
  0% {
    transform: $scale;
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
    transform: $scale;
    filter: $in;
  }
}
</style>
