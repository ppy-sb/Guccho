<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'admin'],
})
</script>

<template>
  <section class="container custom-container mx-auto">
    <nuxt-page />
  </section>
</template>

<style scoped>

</style>
