<template>
  <div class="h-header">
    <div class="container custom-container py-3 mx-auto sm:flex sm:w-full items-center justify-between text-center text-kimberly-900 dark:text-kimberly-100">
      <slot>
        <header-simple-title-with-sub
          v-bind="props"
          class="text-left"
        />
      </slot>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  title: string,
  subtitle: string
}>()
</script>

<style lang="postcss" scoped>
.h-header {
  @apply sm:flex mt-2 items-center justify-between text-center text-kimberly-900 dark:text-kimberly-100;
  /* @apply sm:flex sm:w-full mt-2 items-center justify-between text-center text-kimberly-900 dark:text-kimberly-100 ; */
  transition: 0.3s ease;
  display: flex;
  align-items: center;
  @apply pb-2;
  @screen md {
    padding-top: 3rem;
  }
}
</style>
