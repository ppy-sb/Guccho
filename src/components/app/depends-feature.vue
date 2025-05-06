<script setup lang="ts">
import type { Feature } from '~/def/features'

defineProps<{
  feature: Feature
}>()
</script>

<template>
  <template v-if="isServerFeatureSupported(feature)">
    <slot />
  </template>
  <template v-else>
    <slot name="unsupported" />
  </template>
</template>

<style scoped></style>
