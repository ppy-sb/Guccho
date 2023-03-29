<script setup lang="ts">
import type { RollerItemCharSet, RollerItemMode } from './main'
export interface Props {
  value?: string
  defaultValue?: string
  duration?: number
  charSet?: string[] | RollerItemCharSet | string
  mode?: RollerItemMode | string
}

const props = withDefaults(defineProps<Props>(), {
  value: '123',
  defaultValue: '',
  duration: 500,
})
</script>

<template>
  <div v-bind="$attrs" class="invisible">
    {{ props.value }}
  </div>
</template>
