<script setup lang="ts">
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
const { $client } = useNuxtApp()
const route = useRoute()
const { data: beatmap, refresh } = await useAsyncData(async () => await $client.map.beatmapset.query({ id: route.params.id.toString() }))
</script>

<template>
  <section class="section custom-section pt-20">
    <JsonViewer :value="beatmap" />
  </section>
</template>

<style scoped>

</style>
