import type { Editor as EditorCore, JSONContent } from '@tiptap/core'
import { Editor as EditorVue } from '@tiptap/vue-3'
import useEditorExtensions from './useEditorExtensionsClient'

type JSONCallback = (content: JSONContent) => void

export default (
  reactiveConfig: {
    indent: string
    i18n: { t: (key: string) => string }
  } = {
    indent: '  ',
    i18n: useI18n(),
  },
) => {
  const extensions = useEditorExtensions(reactiveConfig)
  const editor = shallowRef<EditorVue>()
  let created = false

  const subscribedBeforeMounted = new Set<JSONCallback>()
  onBeforeMount(() => {
    const lazyLoadCodeBlock = ({ editor }: { editor: EditorCore }) => {
      const json = editor.getJSON()
      return loadAllLanguagesInJSONContent(json)
    }
    editor.value = new EditorVue({
      extensions,
    })
    editor.value.on('beforeCreate', lazyLoadCodeBlock)
    editor.value.on('update', lazyLoadCodeBlock)
    created = true
    subscribedBeforeMounted.forEach(subscriber =>
      editor.value?.on('update', ({ editor }) => subscriber(editor.getJSON())),
    )
    subscribedBeforeMounted.clear()
  })
  onUnmounted(() => {
    editor.value?.commands.clearContent()
    editor.value?.destroy()
  })

  return {
    editor,
    extensions,
    subscribe(cb: JSONCallback) {
      if (created) {
        return editor.value?.on('update', ({ editor }) => {
          cb(editor.getJSON())
        })
      }
      subscribedBeforeMounted.add(cb)
    },
  }
}
