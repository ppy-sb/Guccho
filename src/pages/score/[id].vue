<script setup lang="ts">
// @ts-expect-error we don't have to know
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'

const route = useRoute()

const id = route.params.id.toString()

const app$ = useNuxtApp()
const data = await app$.$client.score.id.query({ id })
</script>

<template>
  <div v-if="data" class="container custom-container mx-auto mt-20">
    <!-- <t-modal-root>
      <t-modal-wrapper ref="changeAvatar" v-slot="{ closeModal }">
        <t-modal v-if="data">
        </t-modal>
      </t-modal-wrapper>
    </t-modal-root> -->
    <template v-if="data">
      <app-score-heading :score="data" ranking-system="ppv2" />
      <!-- <div>
        {{ data.score }}
      </div> -->
      <JsonViewer :value="data" class="rounded-lg" />
    </template>
  </div>
</template>

<style scoped></style>
