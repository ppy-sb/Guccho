<template>
  <json-viewer
    :value="user"
    :expand-depth="3"
    theme="dark"
  />
</template>

<script setup>
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
const user = inject('user')
</script>
