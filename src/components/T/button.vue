<template>
  <button
    class="btn"
    :class="[
      props.variant && `btn-${props.variant}`
    ]"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
import { variant } from './compose/props'
const emit = defineEmits([
  'click'
])
const props = defineProps({
  variant
})
</script>

<style lang="scss" scoped>

</style>
