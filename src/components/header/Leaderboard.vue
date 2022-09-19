<template>
  <div class="container mx-auto h-header">
    <header-simple-title-with-sub
      title="Leaderboard"
      :subtitle="`${selectedMode} - ${selectedMod}`"
      class="text-left"
    />

    <c-mode-switcher @input="updateTitle" />
  </div>
</template>

<script setup>
const selectedMode = ref('')
const selectedMod = ref('')
const updateTitle = (leaderboard) => {
  console.log(leaderboard)
  selectedMode.value = leaderboard.mode.selected.name
  selectedMod.value = leaderboard.mod.selected.name
}
</script>

<style lang="postcss" scoped>
.h-header {
  @apply sm:flex mt-2 items-center justify-between text-center text-white;
  /* @apply sm:flex sm:w-full mt-2 items-center justify-between text-center text-white ; */
  transition: 0.5s ease;
  @apply pb-2;
  @screen md {
    @apply pt-20
    /* padding-bottom: 4rem */
  }
}
</style>
