<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'
import '@/assets/styles/typography.scss'
import type { Ref } from 'vue'
const user = inject<Ref<{
  id: unknown
  profile: string
}>>('user')
const clientTakeover = ref(false)
const { editor } = useEditor()
const { parseAndImportHighlightLibFromHtml } = useEditorLazyLoadHighlight()
onMounted(async () => {
  if (!user)
    return
  if (user.value.profile) {
    parseAndImportHighlightLibFromHtml(user.value.profile)
    editor.value?.setEditable(false)
    editor.value?.commands.setContent(user.value.profile)
    clientTakeover.value = true
  }
})
</script>

<template>
  <div class="container mx-auto mt-4 custom-container">
    <client-only v-if="(clientTakeover && user?.profile)">
      <EditorContent
        class="custom-typography"
        :editor="editor"
      />
    </client-only>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div
      v-else-if="user?.profile"
      class="custom-typography ssr"
      v-html="user.profile"
    />
  </div>
</template>

<style lang="scss" scoped>

</style>
