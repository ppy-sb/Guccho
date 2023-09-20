<script setup lang="ts">
import type { Ref } from 'vue'

const props = withDefaults(
  defineProps<{
    value?: any
    disabled?: string | boolean
  }>(),
  {
    value: Symbol('tab'),
    disabled: false,
  })

const variant = inject<string>('variant')
const size = inject<string>('size')
const current = inject<Ref<unknown>>('current')
const clickTab = inject<(value: unknown) => void>('select')
const disabledSymbol = inject('disabled')

const isDisabled = computed(() => props.value === disabledSymbol || props.disabled)
const isActive = computed(
  () => isDisabled.value === false && current?.value === props.value,
)
</script>

<template>
  <div
    class="tab"
    :class="[
      variant && `tab-${variant}`,
      size && `tab-${size}`,
      isActive && 'tab-active',
      isDisabled && 'cursor-default',
    ]"
    @click="!isActive && !isDisabled && clickTab?.(value)"
  >
    <slot />
  </div>
</template>

<style scoped></style>
