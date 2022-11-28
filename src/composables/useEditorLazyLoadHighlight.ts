import type { JSONContent } from '@tiptap/core'
import { lowlight } from 'lowlight/lib/core'
import { useRuntimeConfig } from '#app'
export default () => (json: JSONContent) => json.content?.map(async (node) => {
  const { public: { hljs } } = useRuntimeConfig()
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
  try {
    const f = await import(`../../node_modules/highlight.js/es/languages/${hljs[_key].slice(1)}.js`)
    lowlight.registerLanguage(_key, f.default)
    console.info('loaded hljs lib:', hljs[_key])
  }
  catch (e) {
    console.info(e)
  }
  return 1
}) || []
