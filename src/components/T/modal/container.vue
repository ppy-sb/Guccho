<template>
  <div
    class="zoom-modal-container"
    :class="{
      init: stat === 0,
      in: stat === 1,
      out: stat === 2,
      l1: l2Status === 0,
      l2: l2Status === 1,
      'l2-out': l2Status === 2
    }"
  >
    <div class="zoom-modal-background">
      <slot name="modal" v-bind="{openModal, closeModal}">
        <div v-if="props.teleportId" :id="props.teleportId" />
      </slot>
    </div>

    <div ref="content" class="content position-relative">
      <slot v-bind="{openModal, closeModal}" />
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
  if (outerL2) { outerL2(1) }
  stat.value = 1
}
const closeModal = () => {
  if (outerL2) { outerL2(2) }
  stat.value = 2
}
defineExpose({
  openModal,
  closeModal
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
    if (!outerL2) { l2Status.value = 0 }
  })
})
</script>

<style lang="scss">
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

  >.zoom-modal-background {
    // background: rgba(0, 0, 0, .1);
    z-index: 1;

  }

  &.l1>.content {
    animation: zoomOutContent 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
  }

  &.l2>.content {
    animation: zoomOutContentL2 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards !important;
  }

  &.l2-out>.content {
    animation: zoomInContentL2 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;

  }

  >.content {
    z-index: 1;
  }
}

.out {
  .zoom-modal-background {
    z-index: 0;

  }

  >.content {
    animation: zoomInContent 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
  }

}

@keyframes zoomOutContent {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(0.9);
    filter: blur(24px) opacity(0.6) saturate(0.5);
  }
}

@keyframes zoomInContent {
  0% {
    transform: scale(0.9);
    filter: blur(24px) opacity(0.6) saturate(0.5);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes zoomOutContentL2 {
  0% {
    transform: scale(0.9);
    filter: blur(24px) opacity(0.6) saturate(0.5);
  }

  100% {
    transform: scale(0.81);
    filter: blur(32px) opacity(0) saturate(0);
  }
}

@keyframes zoomInContentL2 {
  0% {
    transform: scale(0.81);
    filter: blur(32px) opacity(0) saturate(0);
  }

  100% {
    transform: scale(0.9);
    filter: blur(24px) opacity(0.6) saturate(0.5);
  }
}
</style>
