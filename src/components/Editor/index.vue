<!-- eslint-disable import/no-named-as-default -->
<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUnmount, defineProps, defineEmits } from 'vue'

import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { Editor, EditorContent } from '@tiptap/vue-3'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'

import { lowlight } from 'lowlight/lib/core'
// import css from 'highlight.js/lib/languages/css'
// import js from 'highlight.js/lib/languages/javascript'
// import ts from 'highlight.js/lib/languages/typescript'
// import html from 'highlight.js/lib/languages/xml'
// import python from 'highlight.js/lib/languages/python'
// lowlight.registerLanguage('html', html)
// lowlight.registerLanguage('css', css)
// lowlight.registerLanguage('js', js)
// lowlight.registerLanguage('ts', ts)
// lowlight.registerLanguage('python', python)

import '@/assets/typography.scss'

import MenuBar from './MenuBar.vue'
const props = defineProps({
  content: {
    type: [String, Object],
    default: ''
  }
})
const emit = defineEmits(['update:modelValue'])
const editor = ref<Editor>()
const lazyLoadCodeBlock = ({ editor }: {editor: Editor}) => {
  const json = editor.getJSON()
  json.content?.forEach(async (node) => {
    if (node.type !== 'codeBlock') { return }
    const language = node.attrs?.language
    if (!language) { return }
    if (lowlight.registered(language)) { return }
    try {
      const hljs = await import(`../../../node_modules/highlight.js/es/languages/${language}.js`)
      lowlight.registerLanguage(language, hljs.default)
    } catch (e) {
    }
  })
}
onBeforeMount(() => {
  editor.value = new Editor({
    content: props.content,
    extensions: [
      StarterKit.configure({
        codeBlock: false
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Highlight,
      TaskList,
      TaskItem,
      Typography,
      CharacterCount.configure({
        limit: 10000
      }),
      CodeBlockLowlight.configure({
        lowlight,
        exitOnArrowDown: true
      }),
      Placeholder.configure({
        placeholder: 'Welcome to my userpage!'
      })
    ]
  })
  editor.value.on('beforeCreate', lazyLoadCodeBlock)
  editor.value.on('update', lazyLoadCodeBlock)
  editor.value.on('update', ({ editor }) => emit('update:modelValue', editor.getHTML()))
})
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div v-if="editor" class="editor">
    <menu-bar class="editor__header" :editor="editor" />
    <editor-content
      class="editor__content custom-typography"
      :editor="editor"
    />

    <div class="character-count">
      {{ editor.storage.characterCount.characters() }}/{{ 10000 }} characters
      <br>
      {{ editor.storage.characterCount.words() }} words
    </div>
  </div>
</template>

<style lang="scss">
.editor {
  display: flex;
  flex-direction: column;

  border-radius: 0.75rem;

  &__header {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    flex-wrap: wrap;
    border-bottom: 2px solid;
    border-top: 2px solid;
  }

  &__content {
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    border-bottom: 2px solid ;

    .ProseMirror {
      min-height: 10vh;

      ul[data-type="taskList"] {
        >li {
          @apply flex items-baseline gap-2;

          p {
            @apply my-0 #{!important};
          }
        }
      }

      mark {
        @apply bg-warning dark:bg-kimberly-200 rounded-sm;
      }
    }
  }
}
</style>
