<script setup lang="ts">
const route = useRoute()
const id = route.params.id
if (!id) {
  throw new Error('id required')
}
if (Array.isArray(id)) {
  throw new TypeError('bad id')
}
const { $client } = await useNuxtApp()
const content = await $client.article.getRendered.query(id)
</script>

<template>
  <section class="container mx-auto">
    <div class="mt-20 custom-typography ssr" v-html="content" />
  </section>
</template>
