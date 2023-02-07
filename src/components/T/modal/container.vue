<script setup lang="ts">
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
const content = ref<HTMLElement>()

const stat = ref<Status>('hidden')
const l2Status = ref<Status>('hidden')

const l2 = (value: Status) => {
  l2Status.value = value
}

const modalShownCallback: (() => void)[] = []
const modalClosedCallback: (() => void)[] = []

const outerL2 = inject<typeof l2 | undefined>('openL2', undefined)
const openModal = (cb?: () => void) => {
  if (outerL2) {
    outerL2('show')
  }

  stat.value = 'show'
  if (cb) {
    modalShownCallback.push(cb)
  }
}
const closeModal = (cb?: () => void) => {
  if (outerL2) {
    outerL2('closed')
  }

  stat.value = 'closed'
  if (cb) {
    modalClosedCallback.push(cb)
  }
}
provide('openModal', openModal)
provide('closeModal', closeModal)
provide('stat', stat)

provide('openL2', l2)

// events
onMounted(() => {
  const listener = (e: AnimationEvent) => {
    if (e.animationName === 'zoomInContent') {
      if (e.srcElement !== content.value) {
        return
      }

      nextTick(() => {
        if (stat.value !== 'hidden') {
          stat.value = 'hidden'
        }
        if (outerL2 == null) {
          if (l2Status.value !== 'hidden') {
            l2Status.value = 'hidden'
          }
        }

        for (const cb of modalClosedCallback) {
          cb()
        }
        emit('closed')
      })
    }
    else if (e.animationName === 'zoomOutContent') {
      for (const cb of modalShownCallback) {
        cb()
      }
      emit('shown')
    }
  }
  content.value?.addEventListener('animationend', listener)
  onBeforeUnmount(() => {
    content.value?.removeEventListener('animationend', listener)
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
      <slot name="modal" v-bind="{ openModal, closeModal }">
        <div v-if="props.teleportId" :id="props.teleportId.toString()" />
      </slot>
    </div>

    <div ref="content" class="content notify-safari-something-will-change">
      <slot v-bind="{ openModal, closeModal }" />
    </div>
  </div>
</template>

<style lang="scss">
@import "./shared.scss";
$content-stage1:  opacity(0.4) saturate(0.7);
$content-stage2:  opacity(0.2) saturate(0.3);

$scale: scale(0.97);
$scale2: scale(0.95);

.safari {
  .notify-safari-something-will-change {
    will-change: transform, filter;
  }
}

.zoom-modal-container {
  &[data-l1-status="hidden"] {
    .zoom-modal {
      filter: opacity(0);
    }
    pointer-events: none;
  }

  .zoom-modal-background {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: -50;

    @apply transition-[filter];
  }

  &[data-l1-status="show"] {

    > .zoom-modal-background {
      // background: rgba(0, 0, 0, .1);
      z-index: 40;
      @apply backdrop-blur-sm
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

.zoom-modal-container[data-l2-status="show"] > .zoom-modal-background {
  z-index: 1000 !important;
}
</style>
