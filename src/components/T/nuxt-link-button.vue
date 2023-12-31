<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  variant?: string
  size?: string
  to: RouteLocationRaw
}>()
</script>

<template>
  <nuxt-link-locale
    :to="props.to as any"
    class="btn"
    :class="[
      props.variant && `btn-${props.variant}`,
      props.size && `btn-${props.size}`,
    ]"
  >
    <slot />
  </nuxt-link-locale>
</template>

<style lang="scss" scoped></style>
