<script setup lang="ts">
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'

const { $client } = useNuxtApp()
let browser = false
let interval: ReturnType<typeof setInterval>
const { data, refresh } = await useAsyncData(
  async () => browser && $client.status.public.query(),
)

const systemLoad = ref<HTMLDivElement | null>(null)
const appLoad = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const box = ref<HTMLDivElement | null>(null)
// const systemLoadEdge = ref<HTMLDivElement | null>(null)

onMounted(() => {
  clearInterval(interval)
  browser = true
  interval = setInterval(async () => {
    await refresh()
  }, 2000)
})
onUnmounted(() => clearInterval(interval))
const createStyleObject = (count: number) => ({
  width: `${count}%`,
})
</script>

<template>
  <div v-if="data" class="container mx-auto custom-container mt-20">
    <div ref="box" class="py-8">
      <div class="flex gap-2 mb-2 items-baseline drop-shadow-lg">
        <h1 class="text-3xl">
          System Load
        </h1>
        <span class="text-xl">avg: {{ data.load.system.avg }}</span>
      </div>
      <div ref="systemLoad" class="multi-progress-bar-container bg-kimberly-500/10 shadow-lg">
        <div
          :style="createStyleObject(data.load.system.user)"
          class="multi-progress-bar bg-blue-500 text-white"
        >
          user
        </div>
        <div
          :style="createStyleObject(data.load.system.system)"
          class="multi-progress-bar bg-teal-500 text-white"
        >
          system
        </div>
        <div
          ref="systemLoadEdge"
          :style="createStyleObject(data.load.system.idle)"
          class="multi-progress-bar bg-base-300/10"
        >
          idle
        </div>
      </div>

      <h1 class="text-3xl drop-shadow-lg mb-2">
        App Load
      </h1>
      <div ref="appLoad" class="multi-progress-bar-container bg-kimberly-500/10 shadow-lg">
        <div
          v-for="(_data, app) of data.load.app"
          :key="app"
          :style="createStyleObject(_data.current / data.load.system.current * 100)"
          class="multi-progress-bar bg-blue-500 text-white"
        >
          {{ app }}
        </div>
        <div
          :style="createStyleObject((data.load.system.current - data.load.app.web.current) / data.load.system.current * 100)"
          class="multi-progress-bar bg-base-300/10"
        >
          Other
        </div>
      </div>
    </div>

    <JsonViewer
      :value="data"
      :expand-depth="3"
      theme="light"
      copyable
      class="rounded-3xl"
    />
  </div>
</template>

<style scoped lang="postcss">
.multi-progress-bar-container {
  @apply overflow-hidden h-4 mb-4 text-xs flex rounded-xl;
  .multi-progress-bar {
    @apply shadow-none flex flex-col text-center whitespace-nowrap justify-center transition-[width] duration-300 overflow-hidden text-clip;
  }
}
</style>