<script setup lang="ts">
const props = defineProps<{
  variant?: string
  size?: string
  modelValue: any
}>()
const emit = defineEmits(['update:modelValue'])

const size = computed(() => props.size)
const current = computed(() => props.modelValue)
const disabled = Symbol('disabled tab')
function select(value: unknown) {
  return emit('update:modelValue', value)
}
provide('variant', props.variant)
provide('size', size)
provide('current', current)
provide('select', select)
provide('disabled', disabled)
</script>

<template>
  <div class="tabs" :class="[props.variant === 'boxed' && 'tabs-boxed']">
    <slot v-bind="{ disabled, select }" />
  </div>
</template>
