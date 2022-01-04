<template>
  <div class="titlesub">
    <h2 class="text-lg font-semibold opacity-40 text-center sm:text-left">
      {{ subtitle }}
    </h2>
    <h1 class="text-3xl font-bold text-center sm:text-left">
      {{ title }}
    </h1>
  </div>
</template>

<script>
export default {
  name: 'HeaderSimpleTitleWithSub',
  props: {
    title: {
      type: String,
      default: 'Leaderboard'
    },
    subtitle: {
      type: String,
      default: 'Standard'
    }
  }
}
</script>
