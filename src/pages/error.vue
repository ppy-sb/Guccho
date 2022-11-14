<template>
  <div class="card">
    <div class="card-body">
      {{ props.error }}
      <button @click="handleError">
        Clear errors
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { clearError } from 'nuxt/app'

const props = defineProps<{
  error: Error
}>()
const handleError = () => clearError({ redirect: '/' })
</script>
