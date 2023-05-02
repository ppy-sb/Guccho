<script setup lang="ts">
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
const modal = shallowRef<HTMLElement>()
const d = shallowRef<HTMLDialogElement>()

const stat = shallowRef('hidden')
const l2Status = shallowRef('hidden')

function l2(value: string) {
  l2Status.value = value
}

const modalShownCallback: (() => void)[] = []
const modalClosedCallback: (() => void)[] = []

const outerL2 = inject<typeof l2 | undefined>('openL2', undefined)
function showModal(cb?: () => void) {
  if (outerL2) {
    outerL2('show')
  }

  stat.value = 'show'
  d.value?.showModal()
  if (cb) {
    modalShownCallback.push(cb)
  }
}
function closeModal(cb?: () => void) {
  if (outerL2) {
    outerL2('closed')
  }

  stat.value = 'closed'
  d.value?.close()
  if (cb) {
    modalClosedCallback.push(cb)
  }
}
provide('showModal', showModal)
provide('closeModal', closeModal)
provide('stat', stat)

provide('openL2', l2)

// events
onMounted(() => {
  const listener = (e: AnimationEvent) => {
    if (e.animationName === 'zoomInModalContent') {
      if (e.srcElement !== modal.value) {
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
    else if (e.animationName === 'zoomOutModalContent') {
      for (const cb of modalShownCallback) {
        cb()
      }
      emit('shown')
    }
  }
  modal.value?.addEventListener('animationend', listener)
  onBeforeUnmount(() => {
    modal.value?.removeEventListener('animationend', listener)
  })
})
defineExpose({
  showModal,
  closeModal,
  stat,
})
</script>

<template>
  <div class="zoom-modal-container" :data-l1-status="stat" :data-l2-status="l2Status">
    <dialog ref="d">
      <slot name="modal" v-bind="{ showModal, closeModal }">
        <div v-if="props.teleportId" :id="props.teleportId.toString()" />
      </slot>
    </dialog>

    <div ref="modal" class="zoom-modal-content notify-safari-something-will-change">
      <slot v-bind="{ showModal, closeModal }" />
    </div>
  </div>
</template>
