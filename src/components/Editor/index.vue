<script setup>
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

import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'

import { lowlight } from 'lowlight'

import MenuBar from './MenuBar.vue'

lowlight.registerLanguage('html', html)
lowlight.registerLanguage('css', css)
lowlight.registerLanguage('js', js)
lowlight.registerLanguage('ts', ts)

const editor = ref()

onBeforeMount(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit.configure({
        history: true,
        codeBlock: false,
        mark: {
          multicolor: true
        }
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
        lowlight
      }),
      Placeholder.configure({
        placeholder: 'Welcome to my userpage!'
      })
    ]
  })
})
onBeforeUnmount(() => {
  editor.value.destroy()
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

  // color: ;
  // background-color: #FFF;
  // border: 3px solid ;
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
    // padding: 1.25rem 1rem;
    // @apply py-4;
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
.custom-typography {
  @apply prose prose-slate dark:prose-invert xl:prose-xl max-w-none;

  @apply prose-pre:bg-kimberly-800 prose-pre:text-kimberly-50
}
</style>
