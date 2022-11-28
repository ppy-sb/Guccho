<script setup lang="ts">
// follow component | server
import { reactive, ref } from 'vue'
import { navigateTo, useAppConfig, useRoute } from '#app'
import type { EmitType } from '~/components/app/mode-switcher.vue'

import type { Mode, Ruleset } from '~/types/common'
import type { ComponentLeaderboardItem } from '~/types/leaderboard'
import type { RankingSystem as AvailableRankingSystem, IdType } from '~/server/trpc/config'

const config = useAppConfig()

const route = useRoute()
const { $client } = useNuxtApp()

const availableModes = Object.keys(config.mode)
const availableRulesets = Object.keys(config.ruleset)
const availableRankingSystems = Object.keys(config.rankingSystem)
const mode = (availableModes.includes(route.params.mode as string)
  ? route.params.mode
  : availableModes[0]) as Mode
const ruleset = (availableRulesets.includes(route.params.ruleset as string)
  ? route.params.ruleset
  : availableRulesets[0]) as Ruleset
const rankingSystem = (availableRankingSystems.includes(route.params.ranking as string)
  ? route.params.ranking
  : availableRankingSystems[0]) as AvailableRankingSystem
const page = parseInt(route.params.page as string) || 1

const perPage = 20

if (!route.params.mode || !route.params.ruleset || !route.params.ranking) {
  // rewrite url to show stat of the page
  await navigateTo({
    name: 'leaderboard-mode-ruleset-ranking-page',
    params: {
      mode,
      ruleset,
      ranking: rankingSystem,
    },
  })
}

const selected = reactive<Required<EmitType['input']>>({
  mode,
  ruleset,
  rankingSystem,
})
const table = ref<Array<ComponentLeaderboardItem<IdType, AvailableRankingSystem>>>([])
const fetching = ref(false)
// const page = ref(0)
// const perPage = ref(50)

fetching.value = true
const result = await $client.leaderboard.fetch.query({
  mode: selected.mode,
  ruleset: selected.ruleset,
  rankingSystem: selected.rankingSystem,
  page: page - 1,
  pageSize: perPage,
})

table.value = result
fetching.value = false
</script>

<template>
  <div class="flex flex-col h-full pt-16 leaderboard custom-container md:pt-0">
    <header-simple-title-with-sub
      class="container mx-auto custom-container lg:px-4"
      title="Leaderboard"
      :subtitle="
        (selected.mode
          && selected.ruleset
          && selected.rankingSystem
          && `${config.mode[selected.mode].name} - ${
            config.ruleset[selected.ruleset].name
          } | ${config.rankingSystem[selected.rankingSystem].name}`)
          || ''
      "
    >
      <app-mode-switcher
        v-model="selected"
        :show-sort="true"
        @input="(selected: EmitType['input']) => navigateTo({
          name: 'leaderboard-mode-ruleset-ranking-page',
          params: {
            mode: selected.mode,
            ruleset: selected.ruleset,
            ranking: selected.rankingSystem,
          },
        })"
      />
    </header-simple-title-with-sub>
    <div
      class="container flex mx-auto grow"
      :class="{
        content: table.length,
      }"
    >
      <template v-if="table.length">
        <div class="relative mx-auto overflow-hidden xl:rounded-lg">
          <fetch-overlay :fetching="fetching" />
          <div class="px-8 pt-2">
            <div class="relative overflow-x-auto">
              <table class="table table-compact w-full border-separate whitespace-nowrap">
                <thead class="rounded-lg">
                  <tr>
                    <th>rank</th>
                    <th>flag</th>
                    <th>player</th>
                    <th class="px-4 font-semibold text-center">
                      {{ config.rankingSystem[selected.rankingSystem].name }}
                    </th>
                    <th class="px-4 font-medium text-center">
                      Accuracy
                    </th>
                    <th class="px-4 font-medium text-center">
                      Play Count
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <leaderboard-user-table
                    v-for="(item, index) in table"
                    :key="index"
                    :user="item.user"
                    :place="item.rank"
                    :sort="selected.rankingSystem"
                  />
                </tbody>
              </table>
            </div>
          </div>
          <div class="flex py-4">
            <div class="btn-group mx-auto">
              <t-nuxt-link-button
                v-for="(i) in 5"
                :key="`pagination-${i}`"
                :to="{
                  name: 'leaderboard-mode-ruleset-ranking-page',
                  params: {
                    mode,
                    ruleset,
                    ranking: rankingSystem,
                    page: i,
                  },
                }"
              >
                {{ i }}
              </t-nuxt-link-button>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="pb-10 my-auto text-kimberly-900 dark:text-kimberly-100 grow">
          <h1 class="text-xl font-semibold text-center">
            No one played this mode yet.
          </h1>
          <h2 class="text-sm font-semibold text-center opacity-60">
            Maybe you will be the first one? Go for it.
          </h2>
        </div>
      </template>
    </div>
  </div>
</template>

<style>
/* .table {
  border-spacing: 0 2px
}

.table tr {
  border-radius: 22px
} */
</style>
