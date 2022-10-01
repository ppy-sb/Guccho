<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import '@/assets/typography.scss'

import MenuBar from './MenuBar.vue'
import useEditor from '~/composables/useEditor'
const props = defineProps({
  content: {
    type: [String, Object],
    default: ''
  }
})
const emit = defineEmits(['update:modelValue'])

const [editor, subscribe] = useEditor(props.content)

subscribe((content:string) => emit('update:modelValue', content))

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
