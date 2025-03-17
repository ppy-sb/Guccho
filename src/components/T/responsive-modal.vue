<script setup lang="ts">
const e = useTemplateRef('e')

const showModal: NonNullable<typeof e.value>['showModal'] = _ => e.value?.showModal(_)
const closeModal: NonNullable<typeof e.value>['showModal'] = _ => e.value?.closeModal(_)

defineExpose({
  showModal,
  closeModal,
})
</script>

<template>
  <TModal ref="e" v-slot="props" response-modal>
    <div class="h-[100dvh] md:h-auto flex items-end pb-8">
      <slot v-bind="props" />
    </div>
  </TModal>
</template>
