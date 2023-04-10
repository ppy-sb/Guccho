<script setup lang="ts">
const props = defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <div
    class="container items-center justify-between py-3 mx-auto app-header-container custom-container sm:flex sm:w-full text-gbase-900 dark:text-gbase-100"
  >
    <slot>
      <header-simple-title-with-sub v-bind="props" class="text-left" />
    </slot>
  </div>
</template>

<style lang="postcss" scoped>
.app-header {
  @apply sm:flex mt-2 items-center justify-between text-center text-gbase-900 dark:text-gbase-100;
  /* @apply sm:flex sm:w-full mt-2 items-center justify-between text-center text-gbase-900 dark:text-gbase-100 ; */
  transition: 0.3s ease;
  display: flex;
  align-items: center;
  @apply pb-2;
  @screen md {
    padding-top: 3rem;
  }
}
</style>
