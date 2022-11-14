<template>
  <div class="zoom-modal-container" :data-l1-status="stat" :data-l2-status="l2Status">
    <div class="zoom-modal-background">
      <slot name="modal" v-bind="{ openModal, closeModal }">
        <div v-if="props.teleportId" :id="props.teleportId.toString()" />
      </slot>
    </div>

    <div ref="content" class="content">
      <slot v-bind="{ openModal, closeModal }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, provide, onMounted, nextTick } from 'vue'
import type { Status } from './shared'

const props = defineProps({
  teleportId: {
    type: [String, Number],
    default: undefined
  }
})
const content = ref()

const stat = ref<Status>('hidden')
const l2Status = ref<Status>('hidden')

const l2 = (value: Status) => {
  l2Status.value = value
}

const outerL2 = inject<typeof l2 | undefined>('openL2', undefined)
const openModal = () => {
  if (outerL2) {
    outerL2('show')
  }
  stat.value = 'show'
}
const closeModal = () => {
  if (outerL2) {
    outerL2('closed')
  }
  stat.value = 'closed'
}
defineExpose({
  openModal,
  closeModal,
  stat
})
provide('openModal', openModal)
provide('closeModal', closeModal)
provide('stat', stat)
// provide('l2Stat', l2Status)
provide('openL2', l2)

// events
onMounted(() => {
  content.value.addEventListener('animationend', (e: AnimationEvent) => {
    if (e.animationName !== 'zoomInContent') {
      return
    }
    if (e.srcElement !== content.value) {
      return
    }
    nextTick(() => {
      if (stat.value !== 'hidden') { stat.value = 'hidden' }
      if (!outerL2) {
        if (l2Status.value !== 'hidden') { l2Status.value = 'hidden' }
      }
    })
  })
})
</script>

<style lang="scss">
@import './shared.scss';
$content-stage1: blur(1em) opacity(0.5) saturate(0.5);
$content-stage2: blur(1.3em) opacity(0) saturate(0);

.zoom-modal-container {
  &[data-l1-status="hidden"] {
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

  &[data-l1-status="show"] {
    z-index: 0;

    > .zoom-modal-background {
      // background: rgba(0, 0, 0, .1);
      z-index: 1;
    }

    &[data-l2-status="hidden"] > .content {
      animation: zoomOutContent $duration $animate-function forwards;
    }

    &[data-l2-status="show"] > .content {
      animation: zoomOutContentL2 $duration $animate-function forwards !important;
    }

    &[data-l2-status="closed"] > .content {
      animation: zoomInContentL2 $duration $animate-function forwards;
    }

    > .content {
      z-index: 1;
    }
  }

  &[data-l1-status="closed"] {
    .zoom-modal-background {
      z-index: 0;
    }

    > .content {
      animation: zoomInContent $duration $animate-function forwards;
    }
  }

}

@keyframes zoomOutContent {
  0% {
    transform: scale(1);
    // -webkit-transform: scale(1);
  }

  100% {
    transform: scale(0.9);
    filter: $content-stage1;
    // -webkit-transform: scale(0.9);
    // -webkit-filter: $content-stage1;
  }
}

@keyframes zoomInContent {
  0% {
    transform: scale(0.9);
    filter: $content-stage1;
    // -webkit-transform: scale(0.9);
    // -webkit-filter: $content-stage1;
  }

  100% {
    transform: scale(1);
    // -webkit-transform: scale(1);
  }
}

@keyframes zoomOutContentL2 {
  0% {
    transform: scale(0.9);
    filter: $content-stage1;
    // -webkit-transform: scale(0.9);
    // -webkit-filter: $content-stage1;
  }

  100% {
    transform: scale(0.81);
    filter: $content-stage2;
    // -webkit-transform: scale(0.81);
    // -webkit-filter: $content-stage2;
  }
}

@keyframes zoomInContentL2 {
  0% {
    transform: scale(0.81);
    filter: $content-stage2;
    // -webkit-transform: scale(0.81);
    // -webkit-filter: $content-stage2;
  }

  100% {
    transform: scale(0.9);
    filter: $content-stage1;
    // -webkit-transform: scale(0.9);
    // -webkit-filter: $content-stage1;
  }
}

[data-l2-status="show"] > .zoom-modal-background {
  z-index: 1000 !important;
}
</style>
