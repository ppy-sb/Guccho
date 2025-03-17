<script setup lang="ts">
import type { Callback } from '~/composables/useZoomModal'

const emits = defineEmits<{
  (e: 'cancel', v: Event): void
  (e: 'closed'): void
  (e: 'shown'): void
  (e: 'ready'): void
}>()

const { status, close, show, onNativeCancel: onNativeClose } = useZoomModal()

const wrapper = useTemplateRef('wrapper')

function showModal(cb?: Callback) {
  if (!wrapper.value) {
    return
  }
  show(wrapper.value, cb)
  emits('shown')
}
function closeModal(cb?: Callback) {
  if (!wrapper.value) {
    return
  }
  close(wrapper.value, () => {
    cb?.()
    emits('closed')
  })
}
defineExpose({
  showModal,
  closeModal,
  wrapper,
})

onMounted(() => {
  nextTick(() => {
    emits('ready')
  })
})
</script>

<template>
  <dialog
    ref="wrapper"
    class="flex flex-col overflow-visible t-modal"
    :status="status"
    @cancel="(e: Event) => {
      emits('cancel', e)
      onNativeClose(e)
    }"
  >
    <slot v-bind="{ showModal, closeModal }" />
  </dialog>
</template>

<style lang="scss">
@use "~/assets/styles/modal.scss" as m;

$in: blur(0.5em) opacity(0) saturate(0.5);
.t-modal {
  transition-property: all;
  transition-duration: m.$duration;
  transition-timing-function: m.$animate-function;

  &[status="show"] {
    &::backdrop {
      animation: backdrop-fade-in calc(m.$duration / 1.4)  m.$animate-function forwards;
    }

    @apply scale-100 filter-none;

    &[response-modal] {
      transform: none;
      @apply filter-none;
    }
  }

  &[status="closed"] {
    transform: scale(0.96);
    filter: $in;

    @apply pointer-events-none;

     &::backdrop {
      animation: backdrop-fade-out calc(m.$duration)  m.$animate-function forwards;
    }

    &[response-modal] {
      transform: translateY(5%) scale(0.98);
      filter: $in;

      @screen md {
        transform: scale(0.96);
        filter: $in;
      }
    }
  }
}

@keyframes zoomIn {
  0% {
    transform: scale(0.96);
    filter: $in;
  }
}

@keyframes zoomOut {
  100% {
    transform: scale(0.93);
    filter: $in;
  }
}
@keyframes slideFromBottom {
  0% {
    transform: translateY(5%) scale(0.98);
    filter: $in;
  }
}
@keyframes slideToBottom {
  100% {
    filter: $in;
    transform: translateY(5%) scale(0.98);
  }
}

@keyframes backdrop-fade-in {
  from {
    background-color: transparent;
  }
  to{
    @apply bg-gbase-100/60;
    @apply backdrop-blur-lg;
  }
}
@keyframes backdrop-fade-out {
  from {
    @apply bg-gbase-100/60;
    @apply backdrop-blur-lg;
  }
  to {
     background-color: transparent;
  }
}

@media (prefers-color-scheme: dark) {
  @keyframes backdrop-fade-in {
    from {
      background-color: transparent;
    }
    to{
      @apply bg-gbase-900/80;
      @apply backdrop-blur-lg;
    }
  }
  @keyframes backdrop-fade-out {
    from {
      @apply bg-gbase-900/80;
      @apply backdrop-blur-lg;
    }
    to {
      background-color: transparent;
    }
  }
}
</style>
