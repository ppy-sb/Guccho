<script setup lang="ts">
// @ts-expect-error we don't have to know
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
import { useSession } from '~/store/session'

const fmtPercent = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 2,
})

const fmtCompact = new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'megabyte',
  unitDisplay: 'narrow',
})
const config = useAppConfig()

const session = useSession()

const app$ = useNuxtApp()
let browser = false
let interval: ReturnType<typeof setInterval>
const { data, refresh } = await useAsyncData(
  async () => browser && app$.$client.status.public.query()
)

const serverConfig = session.user?.roles.includes('staff') ? await app$.$client.status.config.query() : undefined

const systemLoad = shallowRef<HTMLDivElement | null>(null)
const appLoad = shallowRef<HTMLDivElement | null>(null)
const box = shallowRef<HTMLDivElement | null>(null)
onBeforeMount(async () => {
  await refresh()
  clearInterval(interval)
  browser = true
  interval = setInterval(async () => {
    await refresh()
  }, 2000)
})
onUnmounted(() => clearInterval(interval))
function createStyleObject(count: number) {
  return {
    width: `${count}%`,
  }
}
</script>

<template>
  <div v-if="data" class="container mx-auto custom-container mt-20">
    <div ref="box" class="py-8">
      <div class="flex gap-2 my-1 items-baseline drop-shadow-lg">
        <h1 class="text-3xl">
          System Load
        </h1>
        <span class="text-xl">avg: {{ fmtPercent.format(data.load.system.avg) }}</span>
        <span class="text-xl">current: {{ fmtPercent.format(data.load.system.current / 100) }}</span>
      </div>
      <div ref="systemLoad" class="multi-progress-bar-container bg-gbase-500/10 shadow-lg">
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
      </div>

      <h1 class="text-3xl drop-shadow-lg my-1">
        App Load
      </h1>
      <div ref="appLoad" class="multi-progress-bar-container bg-gbase-500/10 shadow-lg">
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
          class="multi-progress-bar bg-gbase-300/10"
        >
          Other
        </div>
      </div>

      <div class="flex gap-2 my-1 drop-shadow-lg items-baseline">
        <h1 class="text-3xl">
          Memory
        </h1>
        <h2 class="text-xl">
          Total: {{ fmtCompact.format(data.memory.system.total / 1_000_000) }}
        </h2>
      </div>
      <div ref="appLoad" class="multi-progress-bar-container bg-gbase-500/10 shadow-lg">
        <div
          :style="createStyleObject(data.memory.system.active / data.memory.system.total * 100)"
          class="multi-progress-bar bg-blue-500 text-white"
        >
          active
        </div>
        <div
          :style="createStyleObject(data.memory.system.buffcache / data.memory.system.total * 100)"
          class="multi-progress-bar bg-teal-500 text-white"
        >
          cache
        </div>
        <div
          :style="createStyleObject((data.memory.system.free) / data.memory.system.total * 100)"
          class="multi-progress-bar bg-gbase-300/10"
        >
          free
        </div>
      </div>
    </div>
    <template v-if="session.user?.roles.includes('staff')">
      <h1 class="text-3xl drop-shadow-lg my-1">
        Web App Config
      </h1>
      <JsonViewer
        :value="config"
        :expand-depth="999"
        theme="light"
        copyable
        class="rounded-3xl"
      />
      <h1 class="text-3xl drop-shadow-lg my-1">
        Server Config
      </h1>
      <JsonViewer
        :value="serverConfig"
        :expand-depth="999"
        theme="light"
        copyable
        class="rounded-3xl"
      />
    </template>
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
