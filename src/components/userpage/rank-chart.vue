<script setup lang="ts">
import 'atropos/scss'

import { LineChart } from 'vue-chart-3'
import { Atropos } from 'atropos/vue'
import { userpageLineChartOptions } from '~/common/shared-chart-options'

import { hsvRaw } from '~/palette'
import type { BaseRank } from '~/types/statistics'
import type { GrandLeaderboardRankingSystem, Mode, Ruleset } from '~/types/common'

// import 'chart.js/auto/auto.js'

const hsl = ([h, s, l]: [any, any, any], a: any) => `hsl(${h} ${s}% ${l}% / ${a}%)`
const gRankFill = hsl(hsvRaw.wewak[500], 20)
const cRankFill = hsl(hsvRaw.kimberly[500], 30)

const chars = [' ', ...[...Array(10).keys()].map(String), ',', '#', 'N', '/', 'A', 'a']

// TODO: fix bug: roller-item can not find out the correct size
const update = ref(0)

onMounted(() => {
  setTimeout(() => {
    update.value = 1
  }, 100)
})
// const user = inject('user')
const currentRankingSystem = inject<BaseRank<unknown, Mode, Ruleset, GrandLeaderboardRankingSystem>>('user.currentGrandLeaderboardRankingSystem')
/* mock */
const globalRank = {
  labels: ['Paris', 'Nîmes', 'Toulon', 'Perpignan', 'Autre'],
  datasets: [
    {
      data: [100, 40, 60, 70, 5],
      tension: 0.2,
      backgroundColor: gRankFill,
      borderColor: '#C5CAE9',
      fill: true,
    },
  ],
}
const countryRank = {
  labels: ['Paris', 'Nîmes', 'Toulon', 'Perpignan', 'Autre'],
  datasets: [
    {
      data: [20, 4, 5, 22, 1],
      tension: 0.2,
      backgroundColor: cRankFill,
      borderColor: '#C5CAE9',
      fill: true,
    },
  ],
}
</script>

<template>
  <ClientOnly v-if="currentRankingSystem">
    <section
      class="container mx-auto custom-container"
      v-bind="$attrs"
    >
      <div class="atropos-wrap">
        <Atropos
          class="my-atropos"
          :shadow-offset="-3"
        >
          <div
            data-atropos-offset="0"
            class="relative w-full h-full atropos-bg"
          />
          <LineChart
            v-if="currentRankingSystem.rankHistory"
            data-atropos-offset="-3"
            :chart-data="countryRank"
            style="max-width: 106% !important; height: 320px; top: 10px; left: -3%; right: -3%"
            class="!absolute -z-10"
            :options="userpageLineChartOptions"
          />
          <div
            v-else
            class="absolute top-0 items-center justify-center w-full h-full -z-10 grid"
            data-atropos-offset="-3"
          >
            <div class="mt-8 mr-40 text-xl">
              rank history not available
            </div>
          </div>
          <LineChart
            v-if="currentRankingSystem.countryRankHistory"
            data-atropos-offset="3"
            :chart-data="globalRank"
            style="height: 340px; max-width: 112% !important; top: 20px; left: -6%; right: -6%"
            class="!absolute z-10"
            :options="userpageLineChartOptions"
          />
          <div
            v-else-if="currentRankingSystem.countryRank"
            class="absolute top-0 items-center justify-center w-full h-full -z-10 grid"
            data-atropos-offset="3"
          >
            <div class="mt-20 text-xl ms-40">
              country rank history not available
            </div>
          </div>
          <div
            data-atropos-offset="5"
            class="absolute top-0 w-full h-full"
          >
            <dl class="z-20 flex w-full h-full">
              <div class="w-1/4" />
              <div class="flex flex-col">
                <div class="h-1/5" />
                <dt class="self-end text-xl">
                  Global Rank:
                </dt>
                <dd class="self-end text-5xl">
                  <Roller
                    :char-set="chars"
                    :value="update ? `#${Intl.NumberFormat().format(currentRankingSystem.rank || 0)}` : ' '"
                  />
                </dd>
              </div>
            </dl>
          </div>
          <div
            v-if="currentRankingSystem.countryRank"
            data-atropos-offset="0"
            class="absolute top-0 w-full h-full"
          >
            <dl class="flex w-full h-full">
              <div class="w-3/5" />
              <div class="flex flex-col">
                <div class="h-1/3" />
                <dt class="self-end text-xl">
                  Country Rank:
                </dt>
                <dd class="ml-20 text-3xl">
                  <Roller
                    :char-set="chars"
                    :value="update ? `#${Intl.NumberFormat().format(currentRankingSystem.countryRank)}` : ' '"
                  />
                </dd>
              </div>
            </dl>
          </div>
        </Atropos>
      </div>
    </section>
  </ClientOnly>
</template>

<style lang="postcss">
.atropos-wrap {
  @apply relative overflow-hidden sm:overflow-visible;
  height: 300px;
}

.my-atropos {
  /* position: absolute;
  left: -999px;
  right: -999px;
  width: 100%; */
  height: 300px;
  @apply overflow-hidden -m-8;
  @apply sm:overflow-visible sm:mx-auto;

  .atropos-bg {
    @apply rounded-2xl
  }

  .atropos-inner {
    @apply sm:rounded-2xl sm:overflow-hidden !important
  }

  .atropos-shadow {
    @apply rounded-2xl bg-wewak-300 !important;
    /* width: 102%; */
    /* height: 102%; */
    /* left: -1%; */
    /* top: -1%; */
    filter: blur(40px) saturate(0.7) opacity(0.2) !important
  }
}
</style>
