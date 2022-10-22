<template>
  <div class="app-header">
    <div class="text-center">
      <h1 v-if="title" class="text-3xl font-bold text-center sm:text-left">
        {{ title }}
      </h1>
      <h2 v-if="subtitle" class="text-lg font-semibold text-center whitespace-pre opacity-40 sm:text-left">
        {{ subtitle }}
      </h2>

      <slot name="after-title" />
    </div>
    <div>
      <slot />
      <slot name="right" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeaderSimpleTitleWithSub',
  props: {
    title: {
      type: String,
      default: undefined
    },
    subtitle: {
      type: String,
      default: undefined
    }
  }
}
</script>

<style lang="postcss" scoped>
.app-header {
  @apply sm:flex mt-2 items-center justify-between text-center text-kimberly-900 dark:text-kimberly-100;
  /* @apply sm:flex sm:w-full mt-2 items-center justify-between text-center text-kimberly-900 dark:text-kimberly-100 ; */
  transition: 0.3s ease;
  @apply pb-2;

  @apply md:pt-20;
}
</style>
