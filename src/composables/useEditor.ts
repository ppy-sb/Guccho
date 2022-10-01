/* eslint-disable import/no-named-as-default */
import { ref, onBeforeMount, onBeforeUnmount } from 'vue'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { Editor } from '@tiptap/vue-3'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'

import { lowlight } from 'lowlight/lib/core'
import { useRuntimeConfig } from 'nuxt/app'

export default (content: string | Record<string, unknown>) => {
  const { hljs } = useRuntimeConfig()
  const editor = ref<Editor>()
  const lazyLoadCodeBlock = ({ editor }: {editor: Editor}) => {
    const json = editor.getJSON()
    json.content?.forEach(async (node) => {
      if (node.type !== 'codeBlock') { return }
      const language = node.attrs?.language
      if (!language) { return }
      if (lowlight.registered(language)) { return }
      if (!hljs[language]) { return }
      try {
        console.info('tring to lazy load hljs lib:', hljs[language])
        const f = await import(`../../node_modules/highlight.js/es/languages/${hljs[language]}.js`)
        lowlight.registerLanguage(language, f.default)
      } catch (e) {
        console.info(e)
      }
    })
  }
  onBeforeMount(() => {
    editor.value = new Editor({
      content,
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
    // if (onUpdate) { editor.value.on('update', ({ editor }) => onUpdate(editor.getHTML())) }
  })
  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return [
    editor,
    (cb: (content: string) => void) => editor.value?.on('update', ({ editor }) => cb(editor.getHTML()))
  ]
}
