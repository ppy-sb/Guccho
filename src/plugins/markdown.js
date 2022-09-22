// plugins/markdown-it.ts
import Markdown from 'vue3-markdown-it'
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Markdown)
})
