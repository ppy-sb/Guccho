<script setup lang="ts">
// @ts-expect-error we don't have to know
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
import { Rank } from '~/types/defs'

const route = useRoute()

const id = route.params.id.toString()

const app$ = useNuxtApp()
const data = await app$.$client.score.id.query({ id })
</script>

<template>
  <div v-if="data" class="container custom-container mx-auto">
    <!-- <t-modal>
      <t-modal ref="changeAvatar" v-slot="{ closeModal }">
        <t-modal v-if="data">
        </t-modal>
      </t-modal>
    </t-modal> -->
    <template v-if="data">
      <app-score-heading :score="data" :ranking-system="Rank.PPv2" />
      <!-- <div>
        {{ data.score }}
      </div> -->
      <JsonViewer :value="data" class="rounded-lg" />
    </template>
  </div>
</template>

<style scoped></style>
