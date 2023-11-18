<script>
export default {
  name: 'HeaderSimpleTitleWithSub',
  props: {
    title: {
      type: String,
      default: undefined,
    },
    subtitle: {
      type: String,
      default: undefined,
    },
  },
}
</script>

<template>
  <div class="app-header">
    <div>
      <h1 v-if="title" :id="$attrs.id" class="text-3xl font-bold">
        {{ title }}
      </h1>
      <h2
        v-if="subtitle"
        class="text-lg font-semibold whitespace-pre opacity-40"
      >
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

<style lang="postcss" scoped>
.app-header {
  @apply sm:flex mt-2 items-center justify-between text-gbase-900 dark:text-gbase-100 pl-2;
  /* @apply sm:flex sm:w-full mt-2 items-center justify-between  text-gbase-900 dark:text-gbase-100 ; */
  @apply pb-2;
}
</style>
