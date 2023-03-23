<script setup lang="ts">
import type { JSONContent } from '@tiptap/vue-3'
import type { Ref } from 'vue'
const user = inject<
  Ref<{
    id: unknown
    profile: {
      html: string
      raw: JSONContent
    }
  }>
>('user')
</script>

<template>
  <article-render v-if="user?.profile.html" :json="user.profile.raw" :html="user.profile.html" />
</template>
