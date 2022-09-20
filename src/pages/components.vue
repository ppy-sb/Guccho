<template>
  <div>
    <header-default class="!pb-2" title="components playground" />
    <!-- still don't understand why css got purged. so here's the monkey patch -->
    <div class="container mx-auto">
      <div class="text-3xl font-bold text-center sm:text-left">
        button
      </div>
      <div
        class="flex flex-wrap justify-center"
      >
        <button
          v-for="variant in variants"
          :key="`btn-${variant}`"
          class="btn m-2"
          :class="`btn-${variant}`"
        >
          {{ variant }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
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
