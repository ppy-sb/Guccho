<script setup>
import { EditorContent } from '@tiptap/vue-3'
import { generateHTML } from '@tiptap/html'
import '@/assets/typography.scss'
const user = inject('user')
const clientTakeover = ref(false)
const { editor, extensions } = useEditor()
onBeforeMount(async () => {
  const lazy = useEditorLazyLoadHighlight()
  await Promise.all(lazy(user.value.bio))
  editor.value?.setEditable(false)
  editor.value?.commands.setContent(user.value.bio)
  clientTakeover.value = true
})
</script>
<template>
  <div class="container custom-container mx-auto mt-4">
    <editor-content
      v-if="clientTakeover"
      class="custom-typography"
      :editor="editor"
    />
    <div v-else class="custom-typography ssr" v-html="generateHTML(user.bio, extensions)" />
  </div>
</template>

<style lang="scss" scoped>

</style>
