<template>
  <button @click="handleError">
    Clear errors
  </button>
</template>
<script setup lang="ts">
import { clearError } from 'nuxt/app'

const props = defineProps<{
  error: any
}>()
const handleError = () => clearError({ redirect: '/' })
</script>
