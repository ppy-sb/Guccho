<script setup lang="ts">
import type { JSONContent } from '@tiptap/vue-3'
import '@/assets/styles/typography.scss'
const props = defineProps<{
  json: JSONContent
  html: string
}>()
const { parseAndImportHighlightLibFromHtml } = useEditorLazyLoadHighlight()
await parseAndImportHighlightLibFromHtml(props.html)
</script>

<template>
  <div
    class="container mx-auto mt-4 custom-container"
  >
    <div
      class="custom-typography ssr"
      v-html="props.html"
    />
  </div>
</template>
