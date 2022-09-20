<template>
  <div>
    <section
      class="md:container mx-auto mt-5 md:mt-20 flex flex-col items-center md:flex-row md:items-end gap-5"
    >
      <!-- Logo -->
      <div class="z-10">
        <img class="mask mask-squircle" src="https://via.placeholder.com/300.png">
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
    <section class="pt-4">
      <div class="container mx-auto">
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
            <div class="dropdown dropdown-hover">
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
      </div>
    </section>
    <section class="container mx-auto mt-4">
      <div class="flex justify-center xl:px-8">
        <div class="flex flex-col">
          <dl>
            <dt class="text-xl text-right">
              Global Rank:
            </dt>
            <dd class="text-5xl flex justify-end">
              <client-only>
                <Roller :char-set="chars" :value="update ? `#${Intl.NumberFormat().format(currentRankingSystem.rank)}` : ' '" />
              </client-only>
            </dd>
          </dl>
          <dl>
            <dt class="text-xl text-right">
              Country Rank:
            </dt>
            <dd class="text-5xl flex justify-end">
              <client-only>
                <Roller :char-set="chars" :value="update ? `#${Intl.NumberFormat().format(currentRankingSystem.countryRank)}`: ' '" />
              </client-only>
            </dd>
          </dl>
        </div>
      </div>
    </section>
    <div class="pt-20">
      <json-viewer :value="user" :expand-depth="5" class="px-8" theme="dark" />
    </div>
  </div>
</template>

<script setup>
import { JsonViewer } from 'vue3-json-viewer'
import { Roller } from 'vue-roller'

import 'vue-roller/dist/style.css'
import 'vue3-json-viewer/dist/index.css'
import { demoUser as user } from '@/prototyping/objects/user'
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
  update.value += 1
}, 240)

const currentRankingSystem = computed(() => currentStatistic.value?.ranking?.[tab.value])
const { rankingSystem } = useRuntimeConfig()
</script>

<style scoped lang="postcss">
.user-status {
  @apply text-center text-ebony-clay-400 bg-ebony-clay-800 px-2;
  @apply md:text-left md:rounded md:-mr-1;
  @apply md:[margin-left:-7em] md:[padding-left:7em];
}
.f-tab {
  @apply tab-xs sm:tab-sm md:tab-lg;
}
</style>
