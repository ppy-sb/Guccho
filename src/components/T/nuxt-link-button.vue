<template>
  <nuxt-link
    :to="props.to"
    class="btn"
  >
    Register
  </nuxt-link>
</template>

<script setup>
const props = defineProps({
  to: {
    type: Object,
    default: () => ({
      name: ''
    })
  }
})
</script>
