<template>
  <header-simple-title-with-sub
    class="container mx-auto custom-container lg:px-4"
    title="Leaderboard"
    :subtitle="`${selectedMode} - ${selectedMod} | ${sortBy}`"
  >
    <app-mode-switcher :show-sort="true" @input="updateTitle" />
  </header-simple-title-with-sub>
</template>

<script setup>
const selectedMode = ref('')
const selectedMod = ref('')
const sortBy = ref('')
const updateTitle = (leaderboard) => {
  selectedMode.value = leaderboard.mode.selected?.name
  selectedMod.value = leaderboard.mod.selected?.name
  sortBy.value = leaderboard.sort.selected?.name
}
</script>
