<template>
  <div style="padding-top: 5rem">
    <hr>
    <template
      v-for="variant in [
        'primary',
        'secondary',
        'accent',
        'neutral',
        'base-100',
        'info',
        'success',
        'warning',
        'error'
      ]"
      :key="`btn-${variant}`"
    >
      <button class="btn" :class="`btn-${variant}`">
        button {{ variant }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>
