<script setup lang="ts">
// @ts-expect-error we don't have to know
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
const route = useRoute()

const id = route.params.id.toString()

const { $client } = useNuxtApp()
const data = await $client.score.id.query({ id })
</script>

<template>
  <div class="container custom-container mx-auto mt-20">
    <template v-if="data">
      <div>
        {{ data.score }}
      </div>
      <JsonViewer :value="data" class="rounded-lg" />
    </template>
  </div>
</template>

<style scoped></style>
