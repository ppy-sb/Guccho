<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  variant?: string
  size?: string
  to: RouteLocationRaw
}>()
</script>

<template>
  <nuxt-link
    :to="props.to"
    class="btn"
    :class="[
      props.variant && `btn-${props.variant}`,
      props.size && `btn-${props.size}`,
    ]"
  >
    <slot />
  </nuxt-link>
</template>

<style lang="scss" scoped>

</style>
