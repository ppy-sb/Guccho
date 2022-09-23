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
      <div ref="wrapper" class="zoom-modal-wrapper">
        <div class="zoom-modal">
          <slot name="modal">
            <div :id="props.teleportId" />
          </slot>
        </div>
      </div>
    </div>

    <div ref="content" class="content position-relative">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  teleportId: {
    type: [String, Number],
    default: '_zoom-portal'
  }
})
const content = ref()
const wrapper = ref()

const stat = ref(0)
const l2Status = ref(0)

/* polyfill js until :has got better supports */
const l2 = (value = false) => {
  l2Status.value = value
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
// const top = Symbol('top')
const outterL2 = inject('openL2')
const openModal = () => {
  if (outterL2) { outterL2(1) }
  stat.value = 1
}
const closeModal = () => {
  if (outterL2) { outterL2(2) }
  stat.value = 2
}
defineExpose({
  openModal,
  closeModal
})
provide('openModal', openModal)
provide('closeModal', closeModal)
provide('openL2', l2)

// events
onMounted(() => {
  content.value.addEventListener('animationend', (e) => {
    console.log(e)
    if (e.animationName !== 'zoomInContent') {
      return
    }
    if (e.srcElement !== content.value) {
      return
    }
    stat.value = 0
    if (!outterL2) { l2Status.value = 0 }
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

  // .zoom-modal {
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   right: 0;
  //   bottom: 0;
  //   width: 100vw;
  //   height: 100vh;
  // }

  .zoom-modal-background {
    position: fixed;
    // width: 100vw;
    // height: 100vh;
    // background-color: transparent;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: -50;
  }

  .zoom-modal-wrapper {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    // margin: auto;
    // display: flex;
    // align-items: center;
    // justify-content: center;
  }

  & .zoom-modal-container {
    .zoom-modal-wrapper {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      // margin: auto;
      // display: flex;
      // align-items: center;
      // justify-content: center;
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
}

.in {
  z-index: 0;

  >.zoom-modal-background {
    // background: rgba(0, 0, 0, .7);
    z-index: 1;

    >.zoom-modal-wrapper>.zoom-modal {
      animation: zoomIn 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
    }
  }

  /* too new */

  // &:has(.zoom-modal-container.in) {
  //   >.content {
  //     animation: zoomOutContentL2 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
  //   }
  // }

  // &:has(.zoom-modal-container.out) {
  //   >.content {
  //     animation: zoomInContentL2 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
  //   }
  // }

  // &:not(:has(.zoom-modal-container.in .zoom-modal-container.out)) {

  // }

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

    >.zoom-modal-wrapper>.zoom-modal {
      animation: zoomOut 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
    }
  }

  >.content {
    animation: zoomInContent 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
  }

}

@keyframes zoomIn {
  0% {
    transform: scale(1.4);
    filter: blur(16px) opacity(0) saturate(0.5);
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
    transform: scale(1.2);
    filter: blur(16px) opacity(0) saturate(0.5);
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
