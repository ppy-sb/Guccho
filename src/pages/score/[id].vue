<script setup lang="ts">
const route = useRoute()

const id = route.params.id.toString()

const { $client } = useNuxtApp()
const data = await $client.score.id.query({ id })
</script>

<template>
  <div class="container custom-container mx-auto">
    <template v-if="data">
      <div />
    </template>
  </div>
</template>

<style scoped>

</style>
