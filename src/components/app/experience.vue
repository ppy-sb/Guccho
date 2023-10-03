<script setup lang="ts">
import { useBattery, useFps, useMemory } from '@vueuse/core'

const fps = useFps()
function size(v: number) {
  const kb = v / 1024 / 1024
  return `${kb.toFixed(2)} MiB`
}
const fmt = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 2,
})
function percent(num: number) {
  return fmt.format(num)
}
const { isSupported, memory } = useMemory()
const { charging, level } = useBattery()
</script>

<template>
  <div class="bottom-xp-bar">
    <div class="flex flex-col md:flex-row gap-1">
      <div v-if="isSupported && memory">
        MEM {{ size(memory.usedJSHeapSize) }} /
        {{ size(memory.jsHeapSizeLimit) }} ({{
          percent(memory.usedJSHeapSize / memory.jsHeapSizeLimit)
        }}) | Alloc {{ size(memory.totalJSHeapSize) }}|
      </div>
      <div class="flex gap-1 items-center">
        <icon
          :name="
            charging ? 'ion:battery-charging'
            : level > 75 ? 'ion:battery-full'
              : level > 25 ? 'ion:battery-half'
                : 'ion:battery-dead'
          "
        />
      </div>
    </div>
    <div class="ml-auto whitespace-nowrap">
      {{ fps }} fps
    </div>
  </div>
</template>

<style scoped lang="postcss">
.bottom-xp-bar {
  @apply z-50;
  @apply fixed bottom-0 w-full px-2 border-t-[1px] font-mono flex items-end gap-1 opacity-30;
  @apply bg-gradient-to-b from-base-100 to-base-200 dark:from-base-200 dark:to-base-100 border-base-200;
  @apply pointer-events-none;
}
</style>
