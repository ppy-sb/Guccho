<script setup lang="ts">
const slug = ref('')
const { $client } = await useNuxtApp()
const { data: content, refresh } = await useAsyncData(() => $client.article.get.query(slug.value))
const editor = ref(null)
const editing = ref({ ...content.value?.json })
const save = async () => {
  await $client.article.save.mutate({
    slug: slug.value,
    content: editing.value,
  })
}
const update = async () => {
  await refresh()
  editing.value = content.value?.json
  editor.value.context.editor.value.commands.setContent(editing.value)
}
</script>

<template>
  <section class="container pt-20 pb-8 mx-auto custom-container lg:px-2">
    <div class="flex gap-4 items-baseline pb-2">
      Editing: <input v-model="slug" type="text" class="input input-sm shadow-lg">
      <button class="btn btn-sm btn-info" @click="() => update()">
        Load
      </button>
      <button class="btn btn-sm btn-success" @click="() => save()">
        Save
      </button>
    </div>
    <lazy-editor ref="editor" v-model="editing" class="safari-performance-boost" />
    <!-- <div class="container mx-auto">
    </div> -->
  </section>
</template>
