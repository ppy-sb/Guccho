<script setup lang="ts">
import { onBeforeMount, reactive } from 'vue'
import { EditorContent, JSONContent } from '@tiptap/vue-3'
import '@/assets/typography.scss'

import MenuBar from './MenuBar.vue'
import useEditor from '~/composables/useEditor'
import useEditorLazyLoadHighlight from '~/composables/useEditorLazyLoadHighlight'
const props = withDefaults(defineProps<{
  modelValue?: JSONContent,
  editable?: boolean,
  indent?: string
}>(), {
  modelValue: undefined,
  editable: true,
  indent: '  '
})
const emit = defineEmits(['update:modelValue'])

const editorConf = reactive({
  indent: props.indent
})
const { editor, subscribe } = useEditor(editorConf)

onBeforeMount(async () => {
  const lazy = useEditorLazyLoadHighlight()
  editor.value?.setEditable(props.editable)
  if (props.editable) {
    await Promise.all(lazy(props.modelValue))
    editor.value?.commands.setContent(props.modelValue)
  }
  subscribe((content: Record<string, unknown>) => emit('update:modelValue', content))
})
</script>

<template>
  <div v-if="editor" class="editor">
    <menu-bar v-model:indent="editorConf.indent" class="editor__header" :editor="editor" />
    <editor-content
      class="editor__content custom-typography"
      :editor="editor"
    />
  </div>
</template>

<style lang="scss">
.editor {
  display: flex;
  flex-direction: column;

  // border-radius: 0.75rem;

  &__header {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    flex-wrap: wrap;
    border-top: 2px solid;
    border-bottom: 2px solid;
  }

  &__content {
    flex: 1 1 auto;
    // overflow-x: hidden;
    // overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    // border-bottom: 2px solid ;

    .ProseMirror {
      min-height: 10vh;
      @apply outline-offset-4 overflow-visible
    }
  }
  &__footer {
    @apply mt-2 pt-1;
    border-top: 2px solid;
  }
}
</style>
