<script setup lang="ts">
// @ts-expect-error we don't have to know
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
import { Rank } from '~/def'

const route = useRoute('score-id')

const id = route.params.id

const app$ = useNuxtApp()
const data = await app$.$client.score.id.query({ id })
</script>

<template>
  <div v-if="data" class="container custom-container mx-auto">
    <app-score-heading :score="data" :ranking-system="Rank.PPv2" />

    <dev-only>
      <JsonViewer :value="data" class="rounded-lg" />
    </dev-only>
  </div>
</template>
