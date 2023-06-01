<script setup lang="ts">
import { EditorContent, type JSONContent } from '@tiptap/vue-3'
import '@/components/content/styles/typography.scss'

const props = defineProps<{
  json?: JSONContent
  html: string
}>()

const takeOver = shallowRef(false)
const { editor } = useEditor()

onBeforeMount(async () => {
  editor.value?.setEditable(false)
  if (!props.json) {
    await parseAndImportHighlightLibFromHtml(props.html)
    editor.value?.commands.setContent(props.html)
  }
  else {
    await loadAllLanguagesInJSONContent(props.json)
    editor.value?.commands.setContent(props.json)
  }
  takeOver.value = true
})
</script>

<template>
  <EditorContent v-if="takeOver" class="custom-typography" :editor="editor" />
  <div
    v-else
    class="custom-typography ssr"
    v-html="props.html"
  />
</template>
