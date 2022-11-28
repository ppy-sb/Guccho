<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: undefined,
  },
  size: {
    type: String,
    default: undefined,
  },
  modelValue: {
    type: [String, Number, Symbol],
    default: Symbol,
  },
})
const emit = defineEmits(['update:modelValue'])
if (props.variant !== 'boxed')
  provide('variant', props.variant)

const size = computed(() => props.size)
const current = computed(() => props.modelValue)
const disabled = Symbol('disabled tab')
const select = value => emit('update:modelValue', value)
provide('size', size)
provide('current', current)
provide('select', select)
provide('disabled', disabled)
</script>

<template>
  <div
    class="tabs"
    :class="[props.variant === 'boxed' && 'tabs-boxed']"
  >
    <slot v-bind="{ disabled, select }" />
  </div>
</template>
