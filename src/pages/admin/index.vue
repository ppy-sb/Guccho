<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
})
</script>

<template>
  <section class="container custom-container mx-auto">
    <div class="pt-20" />
    <t-nuxt-link-button
      :to="{
        name: 'article-edit',
      }"
    >
      articles
    </t-nuxt-link-button>
  </section>
</template>

<style scoped>

</style>
