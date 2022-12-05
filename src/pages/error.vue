<script setup lang="ts">
import { clearError } from '#app'

const props = defineProps<{
  error: Error
}>()
const handleError = async () => await clearError({ redirect: '/' })
</script>

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
