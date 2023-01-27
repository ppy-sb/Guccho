<script setup lang="ts">
import { useBattery, useFps, useMemory } from '@vueuse/core'
import {
  faBatteryEmpty,
  faBatteryFull,
  faBatteryHalf,
  faBatteryQuarter,
  faBatteryThreeQuarters,
  faChargingStation,
} from '@fortawesome/free-solid-svg-icons'
import { useFAIconLib } from '#imports'
const { addToLibrary } = useFAIconLib()
addToLibrary(
  faChargingStation,
  faBatteryFull,
  faBatteryThreeQuarters,
  faBatteryHalf,
  faBatteryQuarter,
  faBatteryEmpty,
)
const fps = useFps()
const size = (v: number) => {
  const kb = v / 1024 / 1024
  return `${kb.toFixed(2)} MiB`
}
const fmt = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 2,
})
const percent = (num: number) => fmt.format(num)
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
        <font-awesome-icon
          v-if="charging"
          icon="fa-solid fa-charging-station"
        />
        <font-awesome-icon
          :icon="
            level >= 0.875
              ? 'fa-solid fa-battery-full'
              : level >= 0.625
                ? 'fa-solid fa-battery-three-quarters'
                : level >= 0.375
                  ? 'fa-solid fa-battery-half'
                  : level >= 0.125
                    ? 'fa-solid fa-battery-quarter'
                    : 'fa-solid fa-battery-empty'
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
  @apply fixed bottom-0 w-full px-2 border-t-2 font-mono flex items-end gap-1 opacity-20;
  @apply bg-gradient-to-b from-kimberly-100 to-kimberly-150 dark:from-kimberly-800 dark:to-kimberly-900 border-kimberly-200;
  @apply hover:opacity-100;
}
</style>
