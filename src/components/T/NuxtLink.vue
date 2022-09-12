<template>
  <nuxt-link
    :to="to"
    type="button"
    class="d-button"
  >
    Login
  </nuxt-link>
</template>

<script setup lang="ts">
defineProps({
  to: {
    type: [String, Object],
    default: '#'
  }
})
</script>

<style scoped>

</style>
