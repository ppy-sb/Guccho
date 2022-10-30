<template>
  <nuxt-link
    :to="props.to"
    class="btn"
    :class="[
      props.variant && `btn-${props.variant}`,
      props.size && `btn-${props.size}`
    ]"
  >
    <slot />
  </nuxt-link>
</template>

<script setup lang="ts">

const props = defineProps<{
  variant: string,
  size: string,
  to: any
}>()
</script>

<style lang="scss" scoped>

</style>
