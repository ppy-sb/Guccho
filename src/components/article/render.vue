<script setup lang="ts">
import type { JSONContent } from '@tiptap/vue-3'
import { EditorContent } from '@tiptap/vue-3'
import '@/assets/styles/typography.scss'
const props = defineProps<{
  json: JSONContent
  html: string
}>()
const clientTakeover = ref(false)
const { editor } = useEditor()
const { parseAndImportHighlightLibFromHtml } = useEditorLazyLoadHighlight()
onMounted(async () => {
  if (!props.json) {
    return
  }
  await parseAndImportHighlightLibFromHtml(props.html)
  editor.value?.setEditable(false)
  editor.value?.commands.setContent(props.html)
  clientTakeover.value = true
})
</script>

<template>
  <div
    class="container mx-auto mt-4 custom-container"
  >
    <client-only v-if="clientTakeover">
      <EditorContent class="custom-typography" :editor="editor" />
    </client-only>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      v-else-if="props.html"
      class="custom-typography ssr"
      v-html="props.html"
    />
  </div>
</template>
