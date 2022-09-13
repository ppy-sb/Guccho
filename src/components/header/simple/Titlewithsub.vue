<template>
  <div class="titlesub">
    <h1 v-if="title" class="text-3xl font-bold text-center sm:text-left">
      {{ title }}
    </h1>
    <h2 v-if="subtitle" class="text-lg font-semibold opacity-40 text-center sm:text-left">
      {{ subtitle }}
    </h2>
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
