<script setup lang="ts">
import type { TModal } from '#components'

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
  <t-modal ref="e" v-slot="props">
    <div response-modal class="h-[100dvh] md:h-auto flex items-end pb-8">
      <slot v-bind="props" />
    </div>
  </t-modal>
</template>
