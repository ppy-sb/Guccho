<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'
import type { JSONContent } from '@tiptap/vue-3'
import '@/assets/styles/typography.scss'

const props = defineProps<{
  json?: JSONContent
  html: string
}>()
const { parseAndImportHighlightLibFromHtml } = useEditorLazyLoadHighlight()
await parseAndImportHighlightLibFromHtml(props.html)

const { editor } = useEditor()
const takeOver = shallowRef(false)

onBeforeMount(async () => {
  if (!props.json) {
    return
  }
  await parseAndImportHighlightLibFromHtml(props.html)
  editor.value?.setEditable(false)
  editor.value?.commands.setContent(props.json)
  takeOver.value = true
})
</script>

<template>
  <div
    class="container mx-auto mt-4 custom-container"
  >
    <EditorContent v-if="takeOver" class="custom-typography" :editor="editor" />
    <div
      v-else-if="props.html"
      class="custom-typography ssr"
      v-html="props.html"
    />
  </div>
</template>
