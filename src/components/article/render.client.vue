<script setup lang="ts">
import type { JSONContent } from '@tiptap/vue-3'
import { EditorContent } from '@tiptap/vue-3'
import '@/assets/styles/typography.scss'
const props = defineProps<{
  json: JSONContent
  html: string
}>()
const { editor } = useEditor()
const { parseAndImportHighlightLibFromHtml } = useEditorLazyLoadHighlight()
onMounted(async () => {
  if (!props.json) {
    return
  }
  await parseAndImportHighlightLibFromHtml(props.html)
  editor.value?.setEditable(false)
  editor.value?.commands.setContent(props.json)
})
</script>

<template>
  <div
    class="container mx-auto mt-4 custom-container"
  >
    <EditorContent class="custom-typography" :editor="editor" />
  </div>
</template>
