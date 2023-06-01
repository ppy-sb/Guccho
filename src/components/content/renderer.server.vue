<script setup lang="ts">
import '@/components/content/styles/typography.scss'
import type { JSONContent } from '@tiptap/core'

const props = defineProps<{
  json?: JSONContent
  html: string
}>()
</script>

<template>
  <div
    class="custom-typography ssr"
    v-html="props.html"
  />
</template>
