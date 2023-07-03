<script setup lang="ts">
const props = defineProps<{
  variant?: string
  size?: string
  loading?: boolean
}>()
</script>

<template>
  <button
    class="btn"
    :class="[
      props.variant && `btn-${props.variant}`,
      props.size && `btn-${props.size}`,
      props.loading && 'loading',
    ]"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped></style>
