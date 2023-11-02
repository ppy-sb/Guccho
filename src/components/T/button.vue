<script setup lang="ts">
// loading-xs
// loading-sm
// loading-md
// loading-lg
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
    ]"
  >
    <slot />
    <span v-if="props.loading" :class="[props.loading && 'loading', props.size && `loading-${size}`, variant && `text-${variant}`]" />
  </button>
</template>
