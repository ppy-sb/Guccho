<template>
  <button
    class="btn"
    :class="[
      props.variant && `btn-${props.variant}`,
      props.size && `btn-${props.size}`
    ]"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">

const emit = defineEmits([
  'click'
])
const props = defineProps<{
  variant: string,
  size: string
}>()
</script>

<style lang="scss" scoped>

</style>
