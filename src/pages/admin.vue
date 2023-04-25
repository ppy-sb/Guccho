<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
})
</script>

<template>
  <section class="container custom-container mx-auto">
    <div class="pt-20" />
    <nuxt-page />
  </section>
</template>

<style scoped>

</style>
