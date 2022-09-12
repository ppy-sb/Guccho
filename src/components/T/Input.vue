<template>
  <input
    :value="props.modelValue"
    :class="{ 'errored': props.invalid }"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: undefined
  },
  invalid: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped lang="postcss">
input {
  @apply appearance-none rounded-md bg-hsl-b6 relative block w-full px-3 py-4 placeholder-white placeholder-opacity-25 text-gray-200 font-semibold rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm

  & .error {
    @apply border-red-500 bg-red-500 bg-opacity-20 border-3 border-opacity-30
  }
}
</style>
