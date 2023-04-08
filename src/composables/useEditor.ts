import type { Editor as EditorCore, JSONContent } from '@tiptap/core'
import { Editor as EditorVue } from '@tiptap/vue-3'

import useEditorExtensions from './useEditorExtensions'
import useEditorLazyLoadHighlight from './useEditorLazyLoadHighlight'

export default (
  reactiveConfig: {
    indent: string
  } = {
    indent: '  ',
  },
) => {
  const extensions = useEditorExtensions(reactiveConfig)
  const { load: lazy } = useEditorLazyLoadHighlight()
  const editor = ref<EditorVue>()
  let created = false
  const lazyLoadCodeBlock = ({ editor }: { editor: EditorCore }) => {
    const json = editor.getJSON()
    return Promise.all(lazy(json))
  }

  const subscribedBeforeMounted: CallableFunction[] = []
  onBeforeMount(() => {
    editor.value = new EditorVue({
      extensions,
    })
    editor.value.on('beforeCreate', lazyLoadCodeBlock)
    editor.value.on('update', lazyLoadCodeBlock)
    created = true
    subscribedBeforeMounted.forEach(subscriber =>
      editor.value?.on('update', ({ editor }) => subscriber(editor.getJSON())),
    )
  })
  onUnmounted(() => {
    editor.value?.commands.clearContent()
    editor.value?.destroy()
  })

  return {
    editor,
    extensions,
    subscribe: (cb: (content: JSONContent) => void) => {
      if (created) {
        return editor.value?.on('update', ({ editor }) => {
          cb(editor.getJSON())
        })
      }
      subscribedBeforeMounted.push(cb)
    },
  }
}
