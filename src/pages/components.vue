<template>
  <div>
    <header-default class="!pb-2" title="components playground" />
    <!-- still don't understand why css got purged. so here's the monkey patch -->
    <!-- btn-primary btn-secondary btn-accent btn-neutral btn-info btn-success btn-warning btn-error -->
    <div class="container mx-auto">
      <div class="text-3xl font-bold text-center sm:text-left">
        button
      </div>
      <div
        class="flex justify-center"
      >
        <button
          v-for="variant in variants"
          :key="`btn-${variant}`"
          class="btn m-2"
          :class="`btn-${variant}`"
        >
          button
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const variants = [
  'primary',
  'secondary',
  'accent',
  'neutral',
  'info',
  'success',
  'warning',
  'error'
]
</script>

<style scoped>

</style>
