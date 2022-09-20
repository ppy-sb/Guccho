<script setup>
const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  variant: {
    type: String,
    default: undefined
  },
  size: {
    type: String,
    default: undefined
  },
  modelValue: {
    type: [String, Number, Symbol],
    default: Symbol
  }
})
if (props.variant !== 'boxed') {
  provide('variant', props.variant)
}
const size = computed(() => props.size)
const current = computed(() => props.modelValue)
const disabled = Symbol('disabled tab')
provide('size', size)
provide('current', current)
provide('select', value => emit('update:modelValue', value))
provide('disabled', disabled)
</script>
<template>
  <div class="tabs" :class="[props.variant === 'boxed' && 'tabs-boxed']">
    <slot v-bind="{ disabled }" />
  </div>
</template>
