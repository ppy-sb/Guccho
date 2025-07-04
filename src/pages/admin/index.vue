<script lang="ts" setup>
import { useSession } from '~/store/session'

const app = useNuxtApp()
const session = useSession()
useHead({
  title: () => app.$i18n.t(localeKey.title['admin-panel'].__path__),
  titleTemplate: title => `${title} - ${app.$i18n.t(localeKey.server.name.__path__)}`,
})

const timePeriods = [
  { value: 'daily' as const, label: 'Daily' },
  { value: 'weekly' as const, label: 'Weekly' },
  { value: 'monthly' as const, label: 'Monthly' },
] as const

const q = reactive({
  active: timePeriods[0].value as 'daily' | 'weekly' | 'monthly',
})

const sliderIndex = computed({
  get: () => timePeriods.findIndex(p => p.value === q.active),
  set: (val: number) => {
    q.active = timePeriods[val].value
  },
})

const { data: metrics, status: metricsStatus } = await useAsyncData(
  'admin-metrics',
  async () => session.role.admin ? await app.$client.admin.userManagement.metrics.query({ active: q.active }, { context: { skipBatch: true } }) : raiseError('Unauthorized'),
  { lazy: true, watch: [() => q.active] },
)
const { data: mapMetrics, status: mapMetricsStatus } = await app.$client.admin.map.metrics.useLazyQuery(() => ({ active: q.active }), { trpc: { context: { skipBatch: true } } })
const { data: scoreMetrics, status: scoreMetricsStatus } = await app.$client.admin.score.metrics.useLazyQuery(() => ({ active: q.active }), { trpc: { context: { skipBatch: true } } })
</script>

<template>
  <div class="container mx-auto custom-container p-4">
    <!-- Timeframe Slider (Global) -->
    <div class="w-full md:w-96 flex flex-col items-center mb-6">
      <input
        :value="sliderIndex"
        type="range"
        min="0"
        :max="timePeriods.length - 1"
        step="1"
        class="range range-primary range-sm"
        @mouseup="sliderIndex = ($event.target as HTMLInputElement).valueAsNumber"
      >
      <div class="flex w-full justify-between text-xs">
        <span
          v-for="period in timePeriods"
          :key="period.value"
          :class="[q.active === period.value ? 'font-bold text-primary' : 'text-gray-400']"
        >
          {{ period.label }}
        </span>
      </div>
    </div>
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 class="text-2xl font-bold">
          Users
        </h1>
      </div>

      <!-- Stats Cards -->
      <div class="stats stats-vertical sm:stats-horizontal shadow relative">
        <!-- Overlay for loading -->
        <div
          class="absolute inset-0 flex transition-opacity opacity-0 pointer-events-none blur-sm"
          :class="{ 'opacity-100 !blur-none pointer-events-auto': metricsStatus === 'pending' }"
        >
          <div class="m-auto loading loading-lg" />
        </div>
        <!-- Total Users -->
        <div class="stat" :class="{ 'opacity-30 saturate-50 blur-sm pointer-events-none transition duration-300': metricsStatus === 'pending' }">
          <div class="stat-figure text-primary">
            <icon name="mdi:account-group" class="h-8 w-8" />
          </div>
          <div class="stat-title">
            Total
          </div>
          <div class="stat-value">
            <span>{{ metrics?.count.total?.toLocaleString?.() ?? '-' }}</span>
          </div>
          <div class="stat-desc">
            <template v-if="metricsStatus === 'success'">
              <span v-if="metrics!.count.new > 0" class="text-xs text-success">+ {{ metrics!.count.new.toLocaleString() }} new users</span>
              <span v-else-if="metrics!.count.new < 0" class="text-xs text-warning">- {{ Math.abs(metrics!.count.new).toLocaleString() }} users</span>
              <span v-else class="text-xs">Users registered</span>
            </template>
            <span v-else class="text-xs opacity-60">&nbsp;</span>
          </div>
        </div>
        <!-- Active Users -->
        <div class="stat" :class="{ 'opacity-30 saturate-50 blur-sm pointer-events-none transition duration-300': metricsStatus === 'pending' }">
          <div class="stat-figure text-primary">
            <icon name="mdi:account-check" class="h-8 w-8" />
          </div>
          <div class="stat-title">
            <template v-if="q.active === 'daily'">
              DAU
            </template>
            <template v-else-if="q.active === 'weekly'">
              WAU
            </template>
            <template v-else>
              MAU
            </template>
          </div>
          <div class="stat-value text-primary">
            <span>{{ metrics?.count.active?.toLocaleString?.() ?? '-' }}</span>
          </div>
          <div class="stat-desc">
            Users active
          </div>
        </div>
        <!-- Restricted Users -->
        <div class="stat" :class="{ 'opacity-30 saturate-50 blur-sm pointer-events-none transition duration-300': metricsStatus === 'pending' }">
          <div class="stat-figure text-error">
            <icon name="mdi:account-cancel" class="h-8 w-8" />
          </div>
          <div class="stat-title">
            Restricted
          </div>
          <div class="stat-value text-error">
            <span>{{ metrics?.count.restricted?.toLocaleString?.() ?? '-' }}</span>
          </div>
          <div class="stat-desc">
            Currently restricted accounts
          </div>
        </div>
      </div>
    </div>
    <!-- Map Stats Section -->
    <div class="flex flex-col gap-6 mt-8">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 class="text-2xl font-bold">
          Maps
        </h1>
      </div>
      <div v-if="mapMetrics" class="stats stats-vertical sm:stats-horizontal shadow relative">
        <div
          class="absolute inset-0 flex transition-opacity opacity-0 pointer-events-none blur-sm"
          :class="{ 'opacity-100 !blur-none pointer-events-auto': mapMetricsStatus === 'pending' }"
        >
          <div class="m-auto loading loading-lg" />
        </div>
        <!-- Total Maps -->
        <div class="stat" :class="{ 'opacity-30 saturate-50 blur-sm pointer-events-none transition duration-300': mapMetricsStatus === 'pending' }">
          <div class="stat-figure text-primary">
            <icon name="mdi:music-box-multiple" class="h-8 w-8" />
          </div>
          <div class="stat-title">
            Total
          </div>
          <div class="stat-value">
            <span>{{ mapMetrics?.count.total?.toLocaleString?.() ?? '-' }}</span>
          </div>
          <div class="stat-desc">
            <template v-if="mapMetrics.count.new">
              <span v-if="mapMetrics.count.new > 0" class="text-xs text-success">+ {{ mapMetrics.count.new.toLocaleString() }} new users</span>
              <span v-else-if="mapMetrics.count.new < 0" class="text-xs text-warning">- {{ Math.abs(mapMetrics.count.new).toLocaleString() }} users</span>
            </template>
            <span v-else class="text-xs opacity-60">All maps in database</span>
          </div>
        </div>
        <!-- Ranked Maps -->
        <div class="stat" :class="{ 'opacity-30 saturate-50 blur-sm pointer-events-none transition duration-300': mapMetricsStatus === 'pending' }">
          <div class="stat-figure text-success">
            <icon name="line-md:chevron-small-triple-up" class="h-8 w-8" />
          </div>
          <div class="stat-title">
            Ranked
          </div>
          <div class="stat-value text-success">
            <span>{{ mapMetrics?.count.ranked?.toLocaleString?.() ?? '-' }}</span>
          </div>
          <div class="stat-desc">
            Which counts pp!!
          </div>
        </div>
        <!-- Custom Maps -->
        <div class="stat" :class="{ 'opacity-30 saturate-50 blur-sm pointer-events-none transition duration-300': mapMetricsStatus === 'pending' }">
          <div class="stat-figure text-info">
            <icon name="material-symbols:add-row-below-outline-rounded" class="h-8 w-8" />
          </div>
          <div class="stat-title">
            Custom
          </div>
          <div class="stat-value text-info">
            <span>{{ mapMetrics?.count.custom?.toLocaleString?.() ?? '-' }}</span>
          </div>
          <div class="stat-desc">
            Custom maps
          </div>
        </div>
      </div>
    </div>
    <!-- Score Stats Section -->
    <div class="flex flex-col gap-6 mt-8">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 class="text-2xl font-bold">
          Scores
        </h1>
      </div>
      <div v-if="scoreMetrics" class="stats stats-vertical sm:stats-horizontal shadow relative">
        <div
          class="absolute inset-0 flex transition-opacity opacity-0 pointer-events-none blur-sm"
          :class="{ 'opacity-100 !blur-none pointer-events-auto': scoreMetricsStatus === 'pending' }"
        >
          <div class="m-auto loading loading-lg" />
        </div>
        <!-- Total Scores -->
        <div class="stat" :class="{ 'opacity-30 saturate-50 blur-sm pointer-events-none transition duration-300': scoreMetricsStatus === 'pending' }">
          <div class="stat-figure text-primary">
            <icon name="mdi:counter" class="h-8 w-8" />
          </div>
          <div class="stat-title">
            Total
          </div>
          <div class="stat-value">
            <span>{{ scoreMetrics?.count.total?.toLocaleString?.() ?? '-' }}</span>
          </div>
          <div class="stat-desc">
            All scores in database
          </div>
        </div>
        <!-- New Scores -->
        <div class="stat" :class="{ 'opacity-30 saturate-50 blur-sm pointer-events-none transition duration-300': scoreMetricsStatus === 'pending' }">
          <div class="stat-figure text-success">
            <icon name="mdi:counter" class="h-8 w-8" />
          </div>
          <div class="stat-title">
            Recent
          </div>
          <div class="stat-value text-success">
            <span>{{ scoreMetrics?.count.new?.toLocaleString?.() ?? '-' }}</span>
          </div>
          <div class="stat-desc">
            Submitted in selected period
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.fade-blur-enter-active,
.fade-blur-leave-active {
  transition: opacity 0.3s, filter 0.3s;
}
.fade-blur-enter-from,
.fade-blur-leave-to {
  opacity: 0;
  filter: blur(8px) saturate(0.5);
}
.fade-blur-enter-to,
.fade-blur-leave-from {
  opacity: 1;
  filter: blur(0) saturate(1);
}
</style>
