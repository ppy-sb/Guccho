<script setup lang="ts">
import { generateHTML } from '@tiptap/html'
import { type JSONContent } from '@tiptap/vue-3'
import { notNullish } from '@vueuse/core'

const props = defineProps<
  { json?: JSONContent; html?: string }
>()
const i18n = useI18n()
// eslint-disable-next-line n/prefer-global/process
const extensions = process.server ? useEditorExtensionsServer({ i18n }) : useEditorExtensionsClient({ i18n })

const html = shallowRef(generate())
const el = shallowRef<HTMLElement>()

onBeforeMount(hl)
watch ([props, i18n.locale], () => {
  html.value = generate()
})

watch(html, hl)

function generate() {
  return notNullish(props.html) ? (props.html as string) : generateHTML(props.json as JSONContent, extensions)
}

async function hl() {
  // eslint-disable-next-line n/prefer-global/process
  if (process.server) {
    return html.value
  }
  const _hljs = await import('highlight.js/lib/core').then(m => m.default)
  const hljs = _hljs.newInstance()
  const libs = await parseAndImportHighlightLibFromHtml(html.value) as any[]
  libs.forEach(([lKey, lib]) => {
    if (!hljs.listLanguages().includes(lKey)) {
      hljs.registerLanguage(lKey, lib)
    }
  })
  el.value = document.createElement('div')
  el.value.innerHTML = html.value
  el.value.querySelectorAll('pre code').forEach((cb) => {
    const language = [...cb.classList].find(i => i.startsWith('language-'))?.slice('language-'.length)
    if (!language) {
      return
    }
    const result = hljs.highlight((cb as HTMLElement).innerText, { language }).value
    cb.innerHTML = result
  })
  html.value = el.value.innerHTML
}
</script>

<template>
  <div class="custom-typography" v-html="html" />
</template>
