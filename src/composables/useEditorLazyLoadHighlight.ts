import type { JSONContent } from '@tiptap/core'
import { lowlight } from 'lowlight/lib/core.js'
import hljs from '~~/configs/hljs.json'

async function importLib(language: string) {
  return await import(`../../node_modules/highlight.js/es/languages/${language}.js`)
}
async function useLib(language: string) {
  try {
    const f = await importLib(language)
    lowlight.registerLanguage(language, f.default)
    // eslint-disable-next-line no-console
    console.info('loaded hljs lib:', language)
  }
  catch (e) {
    console.error('error on loading hljs lib:', e)
  }
}
export default () => {
  return {
    load: (json: JSONContent) => {
      return Promise.all(
        json.content?.map(async (node) => {
          if (node.type !== 'codeBlock') {
            return
          }
          const language = node.attrs?.language
          if (!language) {
            return
          }
          const _key = `#${node.attrs?.language}` as keyof typeof hljs
          if (!_key) {
            return
          }
          if (lowlight.registered(language)) {
            return
          }
          if (!hljs[_key]) {
            return
          }
          return useLib(hljs[_key].slice(1))
        }) || []
      )
    },
    useLib,
    importLib,
    async parseAndImportHighlightLibFromHtml(html: string) {
      const ssrCodeLanguages = html.matchAll(/language-(\w+)/gm)
      for (const _language of ssrCodeLanguages) {
        const language = `#${_language[1]}` as keyof typeof hljs
        if (!hljs[language]) {
          continue
        }
        await useLib(hljs[language].slice(1))
      }
    },

    getLanguages(html: string) {
      const ssrCodeLanguages = html.matchAll(/language-(\w+)/gm)
      const languages = []
      for (const _language of ssrCodeLanguages) {
        const language = `#${_language[1]}` as keyof typeof hljs
        if (!hljs[language]) {
          continue
        }
        languages.push(`#${_language[1]}` as keyof typeof hljs)
      }
      return languages
    },
  }
}
