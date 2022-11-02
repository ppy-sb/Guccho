<script setup>
import { EditorContent } from '@tiptap/vue-3'
import { generateHTML } from '@tiptap/html'
import '@/assets/styles/typography.scss'
const user = inject('user')
const clientTakeover = ref(false)
const { editor, extensions } = useEditor()
onBeforeMount(async () => {
  const lazy = useEditorLazyLoadHighlight()
  await Promise.all(lazy(user.value.profile))
  editor.value?.setEditable(false)
  editor.value?.commands.setContent(user.value.profile)
  clientTakeover.value = true
})
</script>
<template>
  <div class="container mx-auto mt-4 custom-container">
    <editor-content
      v-if="clientTakeover"
      class="custom-typography"
      :editor="editor"
    />
    <div v-else-if="user.profile" class="custom-typography ssr" v-html="generateHTML(user.profile, extensions)" />
  </div>
</template>

<style lang="scss" scoped>

</style>
