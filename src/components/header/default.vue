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
<script setup>
const props = defineProps({
  title: {
    type: String,
    default: undefined
  },
  subtitle: {
    type: String,
    default: undefined
  }
})
</script>

<style lang="postcss" scoped>
.h-header {
  display: flex;
  align-items: center;
  transition: 0.5s ease;
  @apply pb-2;
  @screen md {
    padding-top: 3rem;
  }
}
</style>
