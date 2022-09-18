<template>
  <nuxt-link
    :to="props.to"
    class="btn"
    :class="[
      `btn-${variant}`
    ]"
  >
    <slot />
  </nuxt-link>
</template>

<script setup>
const props = defineProps({
  to: {
    type: Object,
    default: () => ({
      name: ''
    })
  },
  variant: {
    type: String,
    default: 'neutral'
  }
})
</script>
