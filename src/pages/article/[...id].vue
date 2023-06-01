<script setup lang="ts">
import '@/components/content/styles/typography.scss'
import { useSession } from '~/store/session'

const route = useRoute()
const { $state } = useSession()

const id = route.params.id
if (!id) {
  throw new Error('id required')
}

const app$ = useNuxtApp()
const content = await app$.$client.article.getRendered.query(id)
</script>

<template>
  <section class="container mx-auto with-editor" :class="{ editable: $state.privilege.staff }">
    <content-renderer v-bind="content" />
  </section>
</template>

<style lang="postcss">
.with-editor.editable {
  & .edit {
    visibility: hidden;
    pointer-events: none;
  }

  &:hover {
    & .edit {
      visibility: visible;
      pointer-events: all;
    }
  }
}
</style>
