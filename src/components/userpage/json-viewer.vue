<template>
  <section

    class="mt-4 custom-container "
  >
    <json-viewer
      :value="user"
      :expand-depth="3"
      theme="dark"
      copyable
      class="rounded-3xl"
    />
  </section>
</template>

<script setup>
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
const user = inject('user')
</script>
