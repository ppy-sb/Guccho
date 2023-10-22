import type { JSONContent } from '@tiptap/core'
import { createLowlight } from 'lowlight'
import allLanguages from '~~/configs/hljs'

export const lowlight = createLowlight()

export type LanguageKey = keyof typeof allLanguages
export type Language = typeof allLanguages[LanguageKey]

export async function importHighlightLanguage(language: Language) {
  return await import(`../../node_modules/highlight.js/es/languages/${language}.js`)
}

export async function useLowlightLanguage(language: Language) {
  try {
    const f = await importHighlightLanguage(language)
    lowlight.register(language, f.default)
  }
  catch (e) {
    console.error('error on loading hljs lib:', e)
  }
}
export async function parseAndImportHighlightLibFromHtml(html: string) {
  const languages = getLanguagesFromHTML(html)
  return Promise.all(languages.map(async lKey => [lKey, await importHighlightLanguage(allLanguages[lKey]).then(v => v.default)]))
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
