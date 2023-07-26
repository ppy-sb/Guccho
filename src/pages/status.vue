<script setup lang="ts">
// @ts-expect-error we don't have to know
import { JsonViewer } from 'vue3-json-viewer'
import 'vue3-json-viewer/dist/index.css'
import { useSession } from '~/store/session'
import { UserPrivilege } from '~/def/user'

const { t } = useI18n()

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
const app = useNuxtApp()

const serverConfig = session.user?.roles.includes(UserPrivilege.Staff)
  ? await app.$client.status.config.query()
  : undefined

const { data, refresh } = await useAsyncData(async () => app.$client.status.public.query())

let interval: ReturnType<typeof setInterval>
onBeforeMount(async () => {
  clearInterval(interval)
  interval = setInterval(async () => {
    await refresh()
  }, 2000)
})
onBeforeUnmount(() => clearInterval(interval))
function percentWidth(count: number) {
  return {
    width: `${count}%`,
  }
}
</script>

<i18n lang="yaml">
en-GB:
  system-load: System Load
  user: User
  system: System
  app-load: App Load
  total: Total
  other: Other
  memory: Memory
  active: Active
  cache: Cache
  free: Free
  web-app-config: Web App Config
  npm-env: npm env
  env: env

zh-CN:
  system-load: 系统负载
  user: 用户
  system: 系统
  app-load: 应用负载
  total: 总计
  other: 其他
  memory: 内存
  active: 活跃
  cache: 缓存
  free: 可用
  web-app-config: 网络应用配置
  npm-env: npm环境变量
  env: 环境变量
</i18n>

<template>
  <div v-if="data" class="container mx-auto custom-container font-mono">
    <div class="flex flex-wrap gap-1 my-1 items-baseline drop-shadow-lg">
      <h1 class="text-xl">
        {{ t('system-load') }}
      </h1>
      <span class="badge text-blue-50 bg-blue-500 border-blue-500">{{ t('user') }}: {{ fmtPercent.format(data.load.system.user / 100) }}</span>
      <span class="badge text-teal-50 bg-teal-500 border-teal-500">{{ t('system') }}: {{ fmtPercent.format(data.load.system.system / 100) }}</span>
    </div>
    <div class="multi-progress-bar-container bg-gbase-500/10 shadow-lg">
      <div
        :style="percentWidth(data.load.system.user)"
        class="multi-progress-bar bg-blue-500 text-white"
      >
        {{ t('user') }}
      </div>
      <div
        :style="percentWidth(data.load.system.system)"
        class="multi-progress-bar bg-teal-500 text-white"
      >
        {{ t('system') }}
      </div>
    </div>

    <h1 class="flex flex-wrap items-baseline gap-1 drop-shadow-lg my-1">
      <div class="text-xl">
        {{ t('app-load') }}
      </div>
      <span class="badge">{{ t('total') }}: {{ fmtPercent.format(data.load.system.current / 100) }}</span>
      <span
        v-for="(_data, key) of data.load.app" :key="key"
        class="badge"
      >{{ key }}: {{ fmtPercent.format(_data.current / data.load.system.current) }}</span>
    </h1>
    <div class="multi-progress-bar-container bg-gbase-500/10 shadow-lg">
      <div
        v-for="(_data, key) of data.load.app"
        :key="key"
        :style="percentWidth(_data.current / data.load.system.current * 100)"
        class="multi-progress-bar bg-blue-500 text-white"
      >
        {{ key }}
      </div>
      <div
        :style="percentWidth((data.load.system.current - data.load.app.web.current) / data.load.system.current * 100)"
        class="multi-progress-bar bg-gbase-300/10"
      >
        {{ t('other') }}
      </div>
    </div>

    <div class="flex flex-wrap gap-1 my-1 drop-shadow-lg items-baseline">
      <h1 class="text-xl">
        {{ t('memory') }}
      </h1>
      <span class="badge text-blue-50 bg-blue-500 border-blue-500">{{ t('active') }}: {{ fmtCompact.format(data.memory.system.active / 1_000_000) }}</span>
      <span class="badge text-teal-50 bg-teal-500 border-teal-500">{{ t('cache') }}: {{ fmtCompact.format(data.memory.system.buffcache / 1_000_000) }}</span>
      <span class="badge">{{ t('total') }}: {{ fmtCompact.format(data.memory.system.total / 1_000_000) }}</span>
      <span class="badge">{{ t('free') }}: {{ fmtCompact.format(data.memory.system.free / 1_000_000) }}</span>
    </div>
    <div class="multi-progress-bar-container bg-gbase-500/10 shadow-lg">
      <div
        :style="percentWidth(data.memory.system.active / data.memory.system.total * 100)"
        class="multi-progress-bar bg-blue-500 text-white"
      >
        {{ t('active') }}
      </div>
      <div
        :style="percentWidth(data.memory.system.buffcache / data.memory.system.total * 100)"
        class="multi-progress-bar bg-teal-500 text-white"
      >
        {{ t('cache') }}
      </div>
      <div
        :style="percentWidth((data.memory.system.free) / data.memory.system.total * 100)"
        class="multi-progress-bar bg-gbase-300/10"
      >
        {{ t('free') }}
      </div>
    </div>

    <template v-if="session.user?.roles.includes(UserPrivilege.Staff)">
      <h1 class="text-xl drop-shadow-lg my-1">
        {{ t('web-app-config') }}
      </h1>
      <JsonViewer
        :value="config"
        :expand-depth="999"
        theme="light"
        copyable
        boxed
        class="rounded-xl"
      />
      <h1 class="text-xl drop-shadow-lg my-1">
        {{ t('npm-env') }}
      </h1>
      <JsonViewer
        :value="serverConfig?.npm"
        :expand-depth="999"
        theme="light"
        copyable
        boxed
        class="rounded-xl"
      />
      <h1 class="text-xl drop-shadow-lg my-1">
        {{ t('env') }}
      </h1>
      <JsonViewer
        :value="{
          ...serverConfig,
          npm: '...',
        }"
        :expand-depth="999"
        theme="light"
        copyable
        boxed
        class="rounded-xl"
      />
    </template>
  </div>
</template>

<style scoped lang="postcss">
.multi-progress-bar-container {
  @apply overflow-hidden h-4 mb-4 text-xs flex rounded-xl shadow;
  .multi-progress-bar {
    @apply shadow-none flex flex-col text-center whitespace-nowrap justify-center transition-[width] duration-300 overflow-hidden text-clip;
  }
}
</style>
