<template>
  <div
    class="zoom-modal-container"
    :class="{
      init: stat === 0,
      in: stat === 1,
      out: stat === 2,
      l1: l2Status === 0,
      l2: l2Status === 1,
      'l2-out': l2Status === 2,
    }"
  >
    <div
      class="zoom-modal-background"
      :class="{
        'z-1000': l2Status === 1
      }"
    >
      <slot name="modal" v-bind="{ openModal, closeModal }">
        <div v-if="props.teleportId" :id="props.teleportId" />
      </slot>
    </div>

    <div ref="content" class="content position-relative">
      <slot v-bind="{ openModal, closeModal }" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  teleportId: {
    type: [String, Number],
    default: undefined
  }
})
const content = ref()

const stat = ref(0)
const l2Status = ref(0)

/* polyfill js until :has got better supports */
const l2 = (value = false) => {
  l2Status.value = value
}

const outerL2 = inject('openL2', undefined)
const openModal = () => {
  if (outerL2) {
    outerL2(1)
  }
  stat.value = 1
}
const closeModal = () => {
  if (outerL2) {
    outerL2(2)
  }
  stat.value = 2
}
defineExpose({
  openModal,
  closeModal,
  stat
})
provide('openModal', openModal)
provide('closeModal', closeModal)
provide('stat', stat)
provide('l2Stat', l2Status)
provide('openL2', l2)

// events
onMounted(() => {
  content.value.addEventListener('animationend', (e) => {
    if (e.animationName !== 'zoomInContent') {
      return
    }
    if (e.srcElement !== content.value) {
      return
    }
    stat.value = 0
    if (!outerL2) {
      l2Status.value = 0
    }
  })
})
</script>

<style lang="scss">
@import './shared.scss';
$content-stage1: blur(1em) opacity(0.5) saturate(0.5);
$content-stage2: blur(1.3em) opacity(0) saturate(0);

.zoom-modal-container {
  &.init {
    .zoom-modal {
      filter: opacity(0);
    }
  }

  .zoom-modal-background {

    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: -50;
  }
}

.in {
  z-index: 0;

  > .zoom-modal-background {
    // background: rgba(0, 0, 0, .1);
    z-index: 1;
  }

  &.l1 > .content {
    animation: zoomOutContent $duration $animate-function forwards;
  }

  &.l2 > .content {
    animation: zoomOutContentL2 $duration $animate-function forwards !important;
  }

  &.l2-out > .content {
    animation: zoomInContentL2 $duration $animate-function forwards;
  }

  > .content {
    z-index: 1;
  }
}

.out {
  .zoom-modal-background {
    z-index: 0;
  }

  > .content {
    animation: zoomInContent $duration $animate-function forwards;
  }
}

@keyframes zoomOutContent {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(0.9);
    filter: $content-stage1;
  }
}

@keyframes zoomInContent {
  0% {
    transform: scale(0.9);
    filter: $content-stage1;
  }

  100% {
    transform: scale(1);
  }
}

@keyframes zoomOutContentL2 {
  0% {
    transform: scale(0.9);
    filter: $content-stage1;
  }

  100% {
    transform: scale(0.81);
    filter: $content-stage2;
  }
}

@keyframes zoomInContentL2 {
  0% {
    transform: scale(0.81);
    filter: $content-stage2;
  }

  100% {
    transform: scale(0.9);
    filter: $content-stage1;
  }
}
.z-1000 {
  z-index: 1000 !important;
}
</style>
