import type { JSONContent } from '@tiptap/core'
import { lowlight } from 'lowlight/lib/core'
import { useRuntimeConfig } from '#app'
export default () => {
  const { public: { hljs } } = useRuntimeConfig()
  async function importLib(language: string) {
    try {
      const f = await import(`../../node_modules/highlight.js/es/languages/${language}.js`)
      lowlight.registerLanguage(language, f.default)
      // eslint-disable-next-line no-console
      console.info('loaded hljs lib:', language)
    }
    catch (e) {
      console.error('error on loading hljs lib:', e)
    }
  }
  return {
    load: (json: JSONContent) => {
      return json.content?.map(async (node) => {
        if (node.type !== 'codeBlock')
          return
        const language = node.attrs?.language
        if (!language)
          return
        const _key = `#${node.attrs?.language}` as keyof typeof hljs
        if (!_key)
          return
        if (lowlight.registered(language))
          return
        if (!hljs[_key])
          return
        return importLib(hljs[_key].slice(1))
      }) || []
    },
    importLib,
    async parseAndImportHighlightLibFromHtml(html: string) {
      const ssrCodeLanguages = html.matchAll(/language-(\w+)/gm)
      for (const _language of ssrCodeLanguages) {
        const language = `#${_language[1]}` as keyof typeof hljs
        if (!hljs[language])
          continue
        await importLib(hljs[language].slice(1))
      }
    },
  }
}
