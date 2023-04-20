<script setup lang="ts">
import type { JSONContent } from '@tiptap/vue-3'
import { EditorContent } from '@tiptap/vue-3'
import '@/assets/styles/typography.scss'

import MenuBar from './MenuBar.vue'
import useEditor from '~/composables/useEditor'
import useEditorLazyLoadHighlight from '~/composables/useEditorLazyLoadHighlight'

const props = withDefaults(
  defineProps<{
    modelValue?: JSONContent
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
})
const context = useEditor(editorConf)
const { editor, subscribe } = context

async function onUpdated() {
  const { load: lazy } = useEditorLazyLoadHighlight()
  if (!props.modelValue) {
    return
  }
  await lazy(props.modelValue)
  editor.value?.commands.setContent(props.modelValue)
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
})
</script>

<template>
  <div v-if="editor" class="editor">
    <MenuBar
      v-model:indent="editorConf.indent"
      class="editor__header"
      :editor="editor"
    />
    <EditorContent class="editor__content custom-typography" :editor="editor" />
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
      @apply outline-offset-4 overflow-visible;
    }
  }
  &__footer {
    @apply mt-2 pt-1;
    border-top: 2px solid;
  }
}
</style>
