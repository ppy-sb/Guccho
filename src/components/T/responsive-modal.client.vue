<script setup lang="ts">
import TModal from './modal/index.vue'

type I = InstanceType<typeof TModal>
const e = shallowRef<I>()

const showModal: I['showModal'] = _ => e.value?.showModal(_)
const closeModal: I['closeModal'] = _ => e.value?.closeModal(_)

defineExpose({
  showModal,
  closeModal,
})
</script>

<template>
  <TModal ref="e" v-slot="{ closeModal }" v-bind="$props">
    <div response-modal class="h-[100dvh] md:h-auto flex items-end pb-8">
      <slot v-bind="{ closeModal }" />
    </div>
  </TModal>
</template>
