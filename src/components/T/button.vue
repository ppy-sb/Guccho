<script setup lang="ts">
const props = defineProps<{
  variant?: string
  size?: string
  loading?: boolean
}>()
const emit = defineEmits<(e: 'click') => void>()
</script>

<template>
  <button
    class="btn"
    :class="[
      props.variant && `btn-${props.variant}`,
      props.size && `btn-${props.size}`,
      props.loading && 'loading',
    ]"
    @click="emit('click')"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped></style>
