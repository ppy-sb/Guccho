<template>
  <button type="submit" class="button" @click="emits('click')">
    Sign in
  </button>
</template>

<script setup lang="ts">
const emits = defineEmits(['click'])
</script>

<style scoped lang="postcss">
.button {
  @apply group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-hsl-h2 hover:bg-hsl-h3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hsl-h1;
}
</style>
