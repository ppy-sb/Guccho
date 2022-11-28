<script setup lang="ts">
import { inject, nextTick, onMounted, provide, ref } from 'vue'
import type { Status } from './shared'

const props = defineProps({
  teleportId: {
    type: [String, Number],
    default: undefined,
  },
})
const emit = defineEmits<{
  (event: 'closed'): void
  (event: 'shown'): void
}>()
const content = ref()

const stat = ref<Status>('hidden')
const l2Status = ref<Status>('hidden')

const l2 = (value: Status) => {
  l2Status.value = value
}

let modalShownCallback = () => {}
let modalClosedCallback = () => {}

const outerL2 = inject<typeof l2 | undefined>('openL2', undefined)
const openModal = (cb?: () => void) => {
  if (outerL2)
    outerL2('show')

  stat.value = 'show'
  modalShownCallback = cb ?? modalShownCallback
}
const closeModal = (cb?: () => void) => {
  if (outerL2)
    outerL2('closed')

  stat.value = 'closed'
  modalClosedCallback = cb ?? modalClosedCallback
}
provide('openModal', openModal)
provide('closeModal', closeModal)
provide('stat', stat)
// provide('l2Stat', l2Status)
provide('openL2', l2)

// events
onMounted(() => {
  content.value.addEventListener('animationend', (e: AnimationEvent) => {
    if (e.animationName === 'zoomInContent') {
      if (e.srcElement !== content.value)
        return

      nextTick(() => {
        if (stat.value !== 'hidden')
          stat.value = 'hidden'
        if (outerL2 == null) {
          if (l2Status.value !== 'hidden')
            l2Status.value = 'hidden'
        }

        modalClosedCallback()
        emit('closed')
      })
    }
    else if (e.animationName === 'zoomOutContent') {
      modalShownCallback()
      emit('shown')
    }
  })
})
defineExpose({
  openModal,
  closeModal,
  stat,
})
</script>

<template>
  <div
    class="zoom-modal-container"
    :data-l1-status="stat"
    :data-l2-status="l2Status"
  >
    <div class="zoom-modal-background">
      <slot
        name="modal"
        v-bind="{ openModal, closeModal }"
      >
        <div
          v-if="props.teleportId"
          :id="props.teleportId.toString()"
        />
      </slot>
    </div>

    <div
      ref="content"
      class="content"
    >
      <slot v-bind="{ openModal, closeModal }" />
    </div>
  </div>
</template>

<style lang="scss">
@import './shared.scss';
$content-stage1: blur(0.6em) opacity(0.5) saturate(0.9);
$content-stage2: blur(1.2em) opacity(0.2) saturate(0.8);

$scale: scale(0.97);
$scale2: scale(0.95);

.content {
  will-change: transform;
  will-change: opacity;
}

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
    transform: $scale;
    filter: $content-stage1;
    // -webkit-transform: $scale;
    // -webkit-filter: $content-stage1;
  }
}

@keyframes zoomInContent {
  0% {
    transform: $scale;
    filter: $content-stage1;
    // -webkit-transform: $scale;
    // -webkit-filter: $content-stage1;
  }

  100% {
    transform: scale(1);
    // -webkit-transform: scale(1);
  }
}

@keyframes zoomOutContentL2 {
  0% {
    transform: $scale;
    filter: $content-stage1;
    // -webkit-transform: $scale;
    // -webkit-filter: $content-stage1;
  }

  100% {
    transform: $scale2;
    filter: $content-stage2;
    // -webkit-transform: $scale2;
    // -webkit-filter: $content-stage2;
  }
}

@keyframes zoomInContentL2 {
  0% {
    transform: $scale2;
    filter: $content-stage2;
    // -webkit-transform: $scale2;
    // -webkit-filter: $content-stage2;
  }

  100% {
    transform: $scale;
    filter: $content-stage1;
    // -webkit-transform: $scale;
    // -webkit-filter: $content-stage1;
  }
}

[data-l2-status="show"] > .zoom-modal-background {
  z-index: 1000 !important;
}
</style>
