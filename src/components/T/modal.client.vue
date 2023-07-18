<script setup lang="ts">
import type { Callback } from '~/composables/useZoomModal'

const emits = defineEmits<{
  (e: 'cancel', v: Event): void
  (e: 'closed'): void
  (e: 'shown'): void
  (e: 'ready'): void
}>()

const { status, close, show, onNativeCancel: onNativeClose } = useZoomModal()

const wrapper = shallowRef<HTMLDialogElement>()

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
    class="t-modal overflow-visible"
    :status="status"
    @cancel="(e: Event) => {
      emits('cancel', e)
      onNativeClose(e)
    }"
  >
    <slot v-bind="{ showModal, closeModal }" />
  </dialog>
</template>

<style lang="scss" scoped>
// .t-modal {
//   & .t-modal {
//     position: fixed;
//     left: 0;
//     right: 0;
//     top: 0;
//     bottom: 0;
//   }

//   img {
//     pointer-events: none;
//   }

//   &[status="show"] {
//     img {
//       pointer-events: all;
//     }
//   }
// }
</style>

<style lang="scss">
@import "~/assets/styles/modal.scss";

$in: blur(0.5em) opacity(0) saturate(0.5);
.t-modal {

  &[status="show"] {

    &::backdrop {

      animation: backdrop-fade-in calc($duration / 1.4) $animate-function forwards;
    }

    animation: zoomIn $duration $animate-function forwards;
    > [response-modal] {
      animation: slideFromBottom calc($duration / 1.4) $animate-function forwards;
      @screen md {
        animation: zoomIn $duration $animate-function forwards;
      }
    }
  }

  &[status="closing"] {

     &::backdrop {
      animation: backdrop-fade-out calc($duration / 1.2) $animate-function forwards;
    }

    animation: zoomOut $duration $animate-function forwards;
    > [response-modal] {
      animation: slideToBottom calc($duration / 1.2) $animate-function forwards;
      @screen md {
        animation: zoomOut $duration $animate-function forwards;
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
    @apply bg-gbase-200/30;
    @apply backdrop-blur-lg;
  }
}
@keyframes backdrop-fade-out {
  from {
    @apply bg-gbase-200/30;
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
