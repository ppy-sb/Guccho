<template>
  <div class="container mx-auto">
    <lazy-editor v-model="html" />

    <div class="py-4">
      <t-button v-if="!showJSON" variant="primary" @click="showJSON = true">
        show json
      </t-button>
      <t-button v-if="showJSON" variant="primary" @click="showJSON = false">
        hide json
      </t-button>
    </div>
    <json-viewer
      v-if="showJSON"
      :value="html"
      :expand-depth="3"
      theme="dark"
      copyable
      class="rounded-3xl"
    />
  </div>
</template>

<script setup>
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
const html = ref({})
const showJSON = ref(false)
</script>

<style lang="scss" scoped>

</style>
