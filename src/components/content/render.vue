<script setup lang="ts">
import { type JSONContent } from '@tiptap/vue-3'

const props = defineProps<{
  json?: JSONContent
  html: string
}>()

const html = shallowRef(props.html)
const el = shallowRef<HTMLElement>()

onBeforeMount(hl)

watch(() => props.html, hl)

async function hl() {
  // eslint-disable-next-line n/prefer-global/process
  if (process.server) {
    return props.html
  }
  const _hljs = await import('highlight.js/lib/core').then(m => m.default)
  const hljs = _hljs.newInstance()
  const libs = await parseAndImportHighlightLibFromHtml(props.html) as any[]
  libs.forEach(([lKey, lib]) => {
    if (!hljs.listLanguages().includes(lKey)) {
      hljs.registerLanguage(lKey, lib)
    }
  })
  el.value = document.createElement('div')
  el.value.innerHTML = props.html
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
  <div
    class="custom-typography"
    v-html="html"
  />
</template>

<style src="@/components/content/styles/typography.scss" lang="scss"></style>
