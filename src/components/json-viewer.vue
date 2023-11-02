<script lang="ts" setup>
// @ts-expect-error we don't have to know
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'

defineProps<{
  value: any
}>()
</script>

<template>
  <JsonViewer :value="value" class="rounded-lg" />
</template>
