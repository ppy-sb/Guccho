<template>
  <client-only>
    <section class="container custom-container mx-auto" v-bind="$attrs">
      <div class="atropos-wrap">
        <atropos class="my-atropos" :shadow-offset="-3">
          <div data-atropos-offset="0" class="relative atropos-bg w-full h-full" />
          <LineChart
            data-atropos-offset="-3"
            :chart-data="countryRank"
            style="max-width: 106% !important; height: 320px; top: 10px; left: -3%; right: -3%"
            class="!absolute -z-10"
            :options="userpageLineChartOptions"
          />
          <LineChart
            data-atropos-offset="3"
            :chart-data="globalRank"
            style="height: 340px; max-width: 112% !important; top: 20px; left: -6%; right: -6%"
            class="!absolute z-10"
            :options="userpageLineChartOptions"
          />
          <div data-atropos-offset="5" class="absolute w-full h-full top-0">
            <dl class="flex w-full h-full z-20">
              <div class="w-1/4" />
              <div class="flex flex-col">
                <div class="h-1/5" />
                <dt class="text-xl self-end">
                  Global Rank:
                </dt>
                <dd class="text-5xl self-end">
                  <Roller
                    :char-set="chars"
                    :value="update ? `#${Intl.NumberFormat().format(currentRankingSystem.rank)}` : ' '"
                  />
                </dd>
              </div>
            </dl>
          </div>
          <div data-atropos-offset="0" class="absolute w-full h-full top-0">
            <dl class="flex w-full h-full">
              <div class="w-3/5" />
              <div class="flex flex-col">
                <div class="h-1/3" />
                <dt class="text-xl self-end">
                  Country Rank:
                </dt>
                <dd class="text-3xl ml-20">
                  <Roller
                    :char-set="chars"
                    :value="update ? `#${Intl.NumberFormat().format(currentRankingSystem.countryRank)}`: ' '"
                  />
                </dd>
              </div>
            </dl>
          </div>
        </atropos>
      </div>
    </section>
  </client-only>
</template>

<script setup>
import 'atropos/scss'

import { LineChart } from 'vue-chart-3'
import { Atropos } from 'atropos/vue'
import { userpageLineChartOptions } from '~/common/shared'

import { hsvRaw } from '~/palette'

import 'chart.js/auto/auto.mjs'

const hsl = ([h, s, l], a) => `hsl(${h} ${s}% ${l}% / ${a}%)`
const gRankFill = hsl(hsvRaw.wewak[500], 20)
const cRankFill = hsl(hsvRaw.kimberly[500], 30)

const chars = [' ', ...[...Array(10).keys()].map(String), ',', '#', 'N', '/', 'A']

// weird bug: roller-item can not find out the correct size
// TODO: investigate this
const update = ref(0)

onMounted(() => {
  setTimeout(() => {
    update.value = 1
  }, 100)
})
// const user = inject('user')
const currentRankingSystem = inject('selectedRankingSystemData')
/* mock */
const globalRank = {
  labels: ['Paris', 'Nîmes', 'Toulon', 'Perpignan', 'Autre'],
  datasets: [
    {
      data: [100, 40, 60, 70, 5],
      tension: 0.2,
      backgroundColor: gRankFill,
      borderColor: '#C5CAE9',
      fill: true
    }
  ]
}
const countryRank = {
  labels: ['Paris', 'Nîmes', 'Toulon', 'Perpignan', 'Autre'],
  datasets: [
    {
      data: [20, 4, 5, 22, 1],
      tension: 0.2,
      backgroundColor: cRankFill,
      borderColor: '#C5CAE9',
      fill: true
    }
  ]
}
</script>

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
