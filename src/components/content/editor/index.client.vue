<script setup lang="ts">
import { generateJSON } from '@tiptap/html'
import { EditorContent, type HTMLContent, type JSONContent } from '@tiptap/vue-3'
import useEditor from '~/composables/useEditor'

const props = withDefaults(
  defineProps<{
    modelValue?: JSONContent
    html?: HTMLContent
    editable?: boolean
    indent?: string
  }>(),
  {
    modelValue: undefined,
    editable: true,
    indent: '  ',
  },
)
const emit = defineEmits(['update:modelValue'])

const editorConf = shallowReactive({
  indent: props.indent,
  i18n: useI18n(),
})
const context = useEditor(editorConf)
const { editor, subscribe, extensions } = context

async function onUpdated() {
  if (!props.modelValue && !props.html) {
    return
  }
  const value = props.modelValue || generateJSON(props.html || '', extensions)
  await loadAllLanguagesInJSONContent(value)
  editor.value?.commands.setContent(value)
}

onBeforeMount(async () => {
  editor.value?.setEditable(props.editable)
  if (props.editable) {
    onUpdated()
  }
  subscribe((content: Record<string, unknown>) =>
    emit('update:modelValue', content),
  )
})
defineExpose({
  context,
  reload() {
    onUpdated()
  },
  generateJSON: (content: HTMLContent) => generateJSON(content, extensions) as JSONContent,
})
</script>

<template>
  <div v-if="editor" class="editor">
    <content-editor-bubble-menu :editor="editor" />
    <content-editor-menu-bar v-model:indent="editorConf.indent" class="editor__header" :editor="editor" />
    <EditorContent class="editor__content custom-typography" :editor="editor" />
  </div>
</template>

<style src="@/components/content/styles/editor.scss" lang="scss"></style>
