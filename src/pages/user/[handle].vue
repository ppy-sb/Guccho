<template>
  <div>
    <section
      class="md:container mx-auto mt-5 md:mt-20 flex flex-col items-center md:flex-row md:items-end gap-5"
    >
      <!-- Logo -->
      <div class="z-10">
        <img class="mask mask-squircle" src="~/assets/images/1.png" width="300">
      </div>
      <!-- info -->
      <div
        class="pt-4 flex flex-col md:p-0 w-full md:w-100 bg-ebony-clay-700 md:bg-transparent md:grow"
      >
        <div
          class="order-3 md:order-1 container mx-auto flex md:justify-end sm:justify-center gap-3 pb-4 md:pb-0"
        >
          <dv-button size="sm" type="primary">
            add as friend
          </dv-button>
          <dv-button size="sm" type="secondary">
            send message
          </dv-button>
        </div>
        <div
          class="sm:order-2 container mx-auto sm:flex sm:gap-1 sm:items-end sm:justify-between md:pb-2"
        >
          <div>
            <div>
              <h1 class="text-5xl text-center md:text-left">
                {{ user.name }}
              </h1>
              <h2
                class="text-3xl text-center md:text-left underline decoration-sky-500 text-ebony-clay-300"
              >
                @{{ user.safeName }}
              </h2>
              <div class="pb-2" />
            </div>
          </div>
          <c-mode-switcher class="self-end" />
        </div>
        <div class="user-status order-3">
          currently offline.
        </div>
      </div>
    </section>
    <section class="container pt-4 mx-auto">
      <t-tabs v-model="tab" variant="bordered">
        <t-tab disabled class="f-tab grow p-0 m-0" />
        <t-tab class="f-tab" value="Timeline">
          Timeline
        </t-tab>
        <template v-for="(stats, key) of currentStatistic.ranking">
          <t-tab
            v-if="rankingSystem[key].show === 'tab'"
            :key="`user-tab-${key}`"
            class="f-tab"
            :value="key"
          >
            {{ rankingSystem[key].name }}
          </t-tab>
        </template>
        <div class="tab f-tab tab-bordered">
          <div class="dropdown dropdown-end dropdown-hover">
            <div tabindex="0">
              Other Ranks
            </div>
            <ul
              tabindex="0"
              class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <template v-for="(stats, key) of currentStatistic.ranking">
                <li v-if="rankingSystem[key].show === 'dropdown'" :key="`user-tab-${key}`">
                  <a>{{ rankingSystem[key].name }}</a>
                </li>
              </template>
              <li><a>Acc Only(v2)</a></li>
            </ul>
          </div>
        </div>
        <t-tab disabled class="f-tab grow p-0 m-0" />
      </t-tabs>
    </section>
    <client-only>
      <section class="container mx-auto mt-4">
        <atropos
          style="height: 300px"
        >
          <div data-atropos-offset="0" class="relative bg-ebony-clay-700 w-full h-full -z-20" />
          <LineChart
            data-atropos-offset="-6"
            :chart-data="countryRank"
            style="max-width: 114% !important; height: 320px; top: 10px; left: -7%; right: -7%"
            class="!absolute -z-10"
            :options="{
              animations: {
                y: {
                  easing: 'easeInOutElastic',
                  from: (ctx) => {
                    if (ctx.type === 'data') {
                      if (ctx.mode === 'default' && !ctx.dropped) {
                        ctx.dropped = true;
                        return 0;
                      }
                    }
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              },
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                yAxes: {
                  display: false
                },
                x: {
                  display: false
                }
              },
              radius: 0,
            }"
          />
          <LineChart
            data-atropos-offset="10"
            :chart-data="globalRank"
            style="height: 340px; max-width: 130% !important; top: 20px; left: -15%; right: -15%"
            class="!absolute z-20"
            :options="{
              animations: {
                y: {
                  easing: 'easeInOutElastic',
                  from: (ctx) => {
                    if (ctx.type === 'data') {
                      if (ctx.mode === 'default' && !ctx.dropped) {
                        ctx.dropped = true;
                        return 0;
                      }
                    }
                  }
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              },
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                yAxes: {
                  display: false
                },
                x: {
                  display: false
                }
              },
              radius: 0,
            }"
          />

          <div data-atropos-offset="12" class="z-30 absolute w-full h-full top-0">
            <dl class="flex w-full h-full">
              <div class="w-1/4" />
              <div class="flex flex-col">
                <div class="h-1/5" />
                <dt class="text-xl self-end">
                  Global Rank:
                </dt>
                <dd class="text-5xl self-end">
                  <Roller :char-set="chars" :value="update ? `#${Intl.NumberFormat().format(currentRankingSystem.rank)}` : ' '" />
                </dd>
              </div>
            </dl>
          </div>
          <div data-atropos-offset="5" class="absolute w-full h-full top-0">
            <dl class="flex w-full h-full">
              <div class="w-3/5" />
              <div class="flex flex-col">
                <div class="h-1/3" />
                <dt class="text-xl self-end">
                  Country Rank:
                </dt>
                <dd class="text-3xl ml-20">
                  <Roller :char-set="chars" :value="update ? `#${Intl.NumberFormat().format(currentRankingSystem.countryRank)}`: ' '" />
                </dd>
              </div>
            </dl>
          </div>
        </atropos>
      </section>
    </client-only>
    <div class="pt-20">
      <json-viewer
        :value="user"
        :expand-depth="5"
        theme="dark"
      />
    </div>
  </div>
</template>

<script setup>
import { JsonViewer } from 'vue3-json-viewer'

import { LineChart } from 'vue-chart-3'
import Atropos from 'atropos/vue'
import { demoUser as user } from '@/prototyping/objects/user'
import { hsvRaw } from '~/palette'

const chars = [' ', ...[...Array(10).keys()].map(String), ',', '#', 'N', '/', 'A']
const tab = ref('ppv2')
const selectedMode = ref('osu')
const selectedRuleset = ref('standard')
const currentStatistic = computed(
  () => user.statistics[selectedMode.value][selectedRuleset.value]
)
// weird bug: roller-item can not find out the correct size
// TODO: investigate this
const update = ref(0)

setTimeout(() => {
  update.value = 1
}, 250)

const currentRankingSystem = computed(() => currentStatistic.value?.ranking?.[tab.value])
const { rankingSystem } = useRuntimeConfig()

const hsl = ([h, s, l], a) => `hsl(${h} ${s}% ${l}% / ${a}%)`
const gRankFill = hsl(hsvRaw.mulberry[500], 20)
const cRankFill = hsl(hsvRaw['ebony-clay'][500], 50)

const globalRank = {
  labels: ['Paris', 'Nîmes', 'Toulon', 'Perpignan', 'Autre'],
  datasets: [
    {
      data: [100, 40, 60, 70, 5],
      tension: 0.3,
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
      tension: 0.3,
      backgroundColor: cRankFill,
      borderColor: '#C5CAE9',
      fill: true
    }
  ]
}
</script>

<style scoped lang="postcss">
.user-status {
  @apply text-center text-ebony-clay-400 bg-ebony-clay-800 px-2;
  @apply md:text-left md:rounded md:-mr-1;
  @apply md:[margin-left:-7em] md:[padding-left:7em];
}
.f-tab {
  @apply tab-sm sm:tab-sm md:tab-lg;
}
</style>

<style lang="scss">
@import 'vue3-json-viewer/dist/index.css';
@import 'atropos/scss';
</style>
<style lang="postcss">
.atropos-inner {
  @apply rounded-3xl overflow-hidden !important
}
.atropos-shadow {
  opacity: 0.8;
}
</style>
