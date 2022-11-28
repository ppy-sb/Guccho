<script setup>
const props = defineProps({
  value: {
    type: [String, Number, Symbol, Array, Object],
    default: () => Symbol('tab'),
  },
  disabled: {
    type: [String, Boolean],
    default: undefined,
  },
})
const variant = inject('variant')
const size = inject('size')
const current = inject('current')
const clickTab = inject('select')
const disabledSymbol = inject('disabled')

const disabled = computed(() => (props.value === disabledSymbol) || props.disabled === '')
const active = computed(() => !disabled.value && current.value === props.value)
</script>

<template>
  <div
    class="tab"
    :class="[
      variant && `tab-${variant}`,
      size && `tab-${size}`,
      active && 'tab-active',
      disabled && 'cursor-default',
    ]"
    @click="!active && !disabled && clickTab(value)"
  >
    <slot />
  </div>
</template>

<style scoped></style>
