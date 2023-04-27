<script setup lang="ts">
import type { Ref } from 'vue'

const props = withDefaults(defineProps<{
  value: any
  disabled: string | boolean
}>(), { value: Symbol('tab'), disabled: false })
const variant = inject<string>('variant')
const size = inject<string>('size')
const current = inject<Ref<unknown>>('current')
const clickTab = inject<(value: unknown) => void>('select')
const disabledSymbol = inject('disabled')

const disabled = computed(() => props.value === disabledSymbol || props.disabled)
const active = computed(
  () => !disabled.value && current?.value === props.value
)
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
    @click="!active && !disabled && clickTab?.(value)"
  >
    <slot />
  </div>
</template>

<style scoped></style>
