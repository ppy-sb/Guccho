<template>
  <div
    ref="wrapper"
    class="zoom-modal-wrapper"
    :class="{
      init: stat === 0,
      in: stat === 1,
      out: stat === 2,
      l1: l2Status === 0,
      l2: l2Status === 1,
      'l2-out': l2Status === 2
    }"
  >
    <div class="zoom-modal">
      <slot v-bind="{openModal, closeModal}" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  initStatus: {
    type: Number,
    default: 0
  }
})
const wrapper = ref(null)
// const status = ref(0)
const openModalContainer = inject('openModal')
const closeModalContainer = inject('closeModal')
const stat = ref(props.initStatus)
const l2Status = inject('l2Stat')

const openModal = () => {
  stat.value = 1
  openModalContainer()
}
const closeModal = () => {
  stat.value = 2
  closeModalContainer()
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

  &.in {
    img {
      pointer-events: all;
    }
  }
}
</style>
<style lang="scss" scoped>
@import './shared.scss';

$in: blur(16px) opacity(0) saturate(0.5);
$scale: scale(1.2);
.zoom-modal-wrapper {
  // position: absolute;
  // left: 0;
  // right: 0;
  // top: 0;
  // bottom: 0;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  &.init {
    visibility: hidden;
    z-index: 0;
    pointer-events: none;

  }
  &.in {
    z-index: 50;

    >.zoom-modal {
      animation: zoomIn $duration $animate-function forwards;
    }
  }

  &.out {
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
