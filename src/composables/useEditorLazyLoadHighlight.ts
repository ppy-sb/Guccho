import { JSONContent } from '@tiptap/core'
import { lowlight } from 'lowlight/lib/core'
import { useRuntimeConfig } from '#app'
export default () => (json: JSONContent) => json.content?.map(async (node) => {
  const { hljs } = useRuntimeConfig()
  if (node.type !== 'codeBlock') { return }
  const language = `#${node.attrs?.language}`
  if (!language) { return }
  if (lowlight.registered(language)) { return }
  if (!hljs[language]) { return }
  try {
    const f = await import(`../../node_modules/highlight.js/es/languages/${hljs[language]}.js`)
    lowlight.registerLanguage(language, f.default)
    console.info('loaded hljs lib:', hljs[language])
  } catch (e) {
    console.info(e)
  }
  return 1
}) || []
