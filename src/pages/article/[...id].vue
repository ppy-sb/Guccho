<script setup lang="ts">
import '@/components/content/styles/typography.scss'

const route = useRoute()

const id = route.params.id
if (!id) {
  throw new Error('id required')
}

const app$ = useNuxtApp()
const content = await app$.$client.article.getRendered.query(id)
</script>

<template>
  <section class="container mx-auto with-editor relative">
    <content-renderer v-bind="content" />
    <button v-if="content.access.write" class="btn btn-neutral d-flex gap-1 absolute top-0 right-0">
      Edit <icon name="ic:round-edit-note" class="w-5 h-5" />
    </button>
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
