<script setup lang="ts">
const route = useRoute('article-id')
const { t, locale } = useI18n()

const id = route.params.id
if (!id) {
  throw new Error(t('error.no-id'))
}

const app$ = useNuxtApp()
const { data: content, refresh, error } = await app$.$client.article.get.useQuery(id)

if (error.value) {
  throw error.value
}

watch([locale], () => refresh())
</script>

<i18n lang="yaml">
en-GB:
  edit: Edit
  error:
    no-id: No article Id provided.

zh-CN:
  edit: 编辑
  error:
    no-id: 没有提供文章ID。

fr-FR:
  edit: Modifier
  # TODO fr translation
  error:
    no-id: No article Id provided.

de-DE:
  edit: Bearbeiten
  # TODO update de translation
  error:
    no-id: No article Id provided.
</i18n>

<template>
  <section class="container mx-auto with-editor relative">
    <content-render v-bind="content" />
    <button v-if="content?.access.write" class="btn btn-shadow btn-neutral flex gap-1 absolute top-0 right-0" @click="() => { navigateTo({ name: 'article-edit', query: { slug: id } }) }">
      {{ t('edit') }} <icon name="ic:round-edit-note" class="w-5 h-5" />
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
