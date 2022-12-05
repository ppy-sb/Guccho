<script setup lang="ts">

</script>

<template>
  <app-layout :has-bg="false">
    <slot />
  </app-layout>
</template>

<style scoped>
@media (prefers-color-scheme: dark) {
  :root {
    background-color: dark;
  }
}
</style>
