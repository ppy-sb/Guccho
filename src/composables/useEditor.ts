/* eslint-disable import/no-named-as-default */
// TODO: considering lazy load libs
import { ref, onBeforeMount, onBeforeUnmount } from 'vue'
import { Editor as EditorVue } from '@tiptap/vue-3'
import type { Editor as EditorCore, JSONContent } from '@tiptap/core'

import useEditorExtensions from './useEditorExtensions'
import useEditorLazyLoadHighlight from './useEditorLazyLoadHighlight'
export default (reactiveConfig: {
  indent: string
} = {
  indent: '  '
}) => {
  const extensions = useEditorExtensions(reactiveConfig)
  const lazy = useEditorLazyLoadHighlight()
  const editor = ref<EditorVue>()
  let mounted = false
  const lazyLoadCodeBlock = ({ editor }: {editor: EditorCore}) => {
    const json = editor.getJSON()
    lazy(json)
  }

  const subscribedBeforeMounted: Array<CallableFunction> = []
  onBeforeMount(() => {
    editor.value = new EditorVue({
      extensions
    })
    editor.value.on('beforeCreate', lazyLoadCodeBlock)
    editor.value.on('update', lazyLoadCodeBlock)
    mounted = true
    subscribedBeforeMounted.forEach(subscriber => editor.value?.on('update', ({ editor }) => subscriber(editor.getJSON())))
  })
  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return {
    editor,
    extensions,
    subscribe: (cb: (content: JSONContent) => void) => {
      if (mounted) {
        return editor.value?.on('update', ({ editor }) => {
          cb(editor.getJSON())
        })
      }
      subscribedBeforeMounted.push(cb)
    }
  }
}
