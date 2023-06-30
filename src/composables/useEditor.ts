import type { Editor as EditorCore, JSONContent } from '@tiptap/core'
import { Editor as EditorVue } from '@tiptap/vue-3'

import { lowlight } from 'lowlight/lib/core.js'
import useEditorExtensions from './useEditorExtensionsClient'
import allLanguages from '~~/configs/hljs'

type JSONCallback = (content: JSONContent) => void
type LanguageKey = keyof typeof allLanguages
type Language = typeof allLanguages[LanguageKey]

export async function importLowlightLanguage(language: Language) {
  return await import(`../../node_modules/highlight.js/es/languages/${language}.js`)
}

export async function useLowlightLanguage(language: Language) {
  try {
    const f = await importLowlightLanguage(language)
    lowlight.registerLanguage(language, f.default)
  }
  catch (e) {
    console.error('error on loading hljs lib:', e)
  }
}
export async function parseAndImportHighlightLibFromHtml(html: string) {
  const languages = getLanguagesFromHTML(html)
  return Promise.all(languages.map(lKey => useLowlightLanguage(allLanguages[lKey])))
}

export function getLanguagesFromHTML(html: string) {
  const matchedLanguages = html.matchAll(/language-(\w+)/gm)
  const languages = [] as LanguageKey[]
  for (const _language of matchedLanguages) {
    const language = _language[1] as LanguageKey
    if (!allLanguages[language]) {
      continue
    }
    languages.push(_language[1] as LanguageKey)
  }
  return languages
}
export function loadAllLanguagesInJSONContent(json: JSONContent) {
  return json.content
    ? Promise.allSettled(json.content?.map((node) => {
      if (node.type !== 'codeBlock') {
        return undefined
      }

      const language = node.attrs?.language as LanguageKey | undefined
      if (!language) {
        return undefined
      }

      if (lowlight.registered(language)) {
        return undefined
      }

      if (!allLanguages[language]) {
        return undefined
      }

      return useLowlightLanguage(allLanguages[language])
    })).then(noop)
    : Promise.resolve()
}

export default (
  reactiveConfig: {
    indent: string
  } = {
    indent: '  ',
  }
) => {
  const extensions = useEditorExtensions(reactiveConfig)
  const editor = shallowRef<EditorVue>()
  let created = false
  const lazyLoadCodeBlock = ({ editor }: { editor: EditorCore }) => {
    const json = editor.getJSON()
    return loadAllLanguagesInJSONContent(json)
  }

  const subscribedBeforeMounted = new Set<JSONCallback>()
  onBeforeMount(() => {
    editor.value = new EditorVue({
      extensions,
    })
    editor.value.on('beforeCreate', lazyLoadCodeBlock)
    editor.value.on('update', lazyLoadCodeBlock)
    created = true
    subscribedBeforeMounted.forEach(subscriber =>
      editor.value?.on('update', ({ editor }) => subscriber(editor.getJSON()))
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
