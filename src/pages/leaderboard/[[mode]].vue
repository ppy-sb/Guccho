<script setup lang="ts">
// TODO check max pages
import type { ActiveMode, ActiveRuleset, LeaderboardRankingSystem } from '~/types/common'
import type { SwitcherPropType } from '~/composables/useSwitcher'

const config = useAppConfig()

const route = useRoute()
const router = useRouter()
const app$ = useNuxtApp()

const { mode: pMode } = route.params
const { ruleset: pRuleset, ranking: pRankingSystem, page: pPage } = route.query

const availableModes = Object.keys(config.mode)
const availableRulesets = Object.keys(config.ruleset)
const availableRankingSystems = Object.keys(config.leaderboardRankingSystem)
const mode = (
  (isString(pMode) && availableModes.includes(pMode))
    ? pMode
    : availableModes[0]
) as ActiveMode
const ruleset = (
  (isString(pRuleset) && availableRulesets.includes(pRuleset))
    ? pRuleset
    : availableRulesets[0]
) as ActiveRuleset
const rankingSystem = (
  (isString(pRankingSystem) && availableRankingSystems.includes(pRankingSystem))
    ? pRankingSystem
    : availableRankingSystems[0]
) as LeaderboardRankingSystem
const page = shallowRef((isString(pPage) && Number.parseInt(pPage)) || 1)

const perPage = 20

if (!pMode || !pRuleset || !pRankingSystem) {
  // rewrite url to show stat of the page
  await navigateTo({
    name: 'leaderboard-mode',
    params: {
      mode,
    },
    query: {
      ruleset,
      ranking: rankingSystem,
    },
  })
}

const total = await app$.$client.leaderboard.overallRange.query()

const outOfRange = page.value * perPage - perPage > total
if (outOfRange) {
  page.value = Math.floor(total / perPage)
}

const selected = shallowRef<Required<SwitcherPropType<LeaderboardRankingSystem>>>({
  mode,
  ruleset,
  rankingSystem,
})
const {
  data: table,
  pending,
  refresh,
} = await useAsyncData(() =>
  app$.$client.leaderboard.overall.query({
    mode: selected.value.mode,
    ruleset: selected.value.ruleset,
    rankingSystem: selected.value.rankingSystem,
    page: page.value - 1,
    pageSize: perPage,
  })
)

useHead({
  titleTemplate: `%s - Leaderboard - ${config.title}`,
  title: computed(() => ` ${selected.value.mode} | ${selected.value.ruleset} | ${selected.value.rankingSystem}`),
})

function rewriteHistory() {
  const l = window.location
  const r = router.resolve({
    name: 'leaderboard-mode',
    params: {
      mode: selected.value.mode,
    },
    query: {
      ranking: selected.value.rankingSystem,
      ruleset: selected.value.ruleset,
      page: page.value,
    },
  })

  const rewrite = l.origin + r.fullPath
  history.replaceState({}, '', rewrite)
}

function reloadPage(i?: number) {
  if (i) {
    page.value = i
  }
  table.value && (table.value.length = 0)
  rewriteHistory()
  refresh()
}
</script>

<template>
  <div class="flex flex-col h-full leaderboard custom-container">
    <header-simple-title-with-sub
      class="container mx-auto custom-container lg:px-4"
      title="Leaderboard"
      :subtitle="
        (selected.mode
          && selected.ruleset
          && selected.rankingSystem
          && `${config.mode[selected.mode].name} - ${
            config.ruleset[selected.ruleset].name
          } | ${config.leaderboardRankingSystem[selected.rankingSystem].name}`)
          || ''
      "
    >
      <app-mode-switcher
        v-model="selected"
        :show-sort="true"
        @update:model-value="reloadPage()"
      />
    </header-simple-title-with-sub>
    <div
      v-if="table"
      class="container flex flex-col mx-auto grow"
      :class="{
        content: table.length,
      }"
    >
      <!-- <fetch-overlay :fetching="pending" /> -->

      <div v-if="table.length" class="relative mx-auto xl:rounded-lg w-full max-w-max overflow-x-auto">
        <table
          class="table mx-2 table-compact border-separate whitespace-nowrap"
        >
          <thead class="rounded-lg">
            <tr>
              <th>rank</th>
              <th>flag</th>
              <th>player</th>
              <th class="px-4 font-semibold text-center">
                {{
                  config.leaderboardRankingSystem[selected.rankingSystem].name
                }}
              </th>
              <th class="px-4 font-medium text-center">
                Accuracy
              </th>
              <th class="px-4 font-medium text-center">
                Play Count
              </th>
            </tr>
          </thead>
          <transition name="slide">
            <tbody v-if="!pending">
              <leaderboard-user-table
                v-for="(item, index) in table"
                :key="index"
                :user="item.user"
                :in-this-leaderboard="item.inThisLeaderboard"
                :sort="selected.rankingSystem"
              />

              <!-- <template v-else>
                    Loading...
                  </template> -->
            </tbody>
          </transition>
        </table>
      </div>
      <div
        v-else-if="!pending"
        class="pb-10 my-auto text-gbase-900 dark:text-gbase-100 grow"
      >
        <h1 class="text-xl font-semibold text-center">
          No one played this mode yet.
        </h1>
        <h2 class="text-sm font-semibold text-center opacity-60">
          Wanna be the first one? Go for it.
        </h2>
      </div>
      <div class="flex py-4">
        <t-tabs
          :model-value="page"
          class="mx-auto items-baseline"
          size="lg"
          @update:model-value="v => reloadPage(v)"
        >
          <t-tab
            v-for="i in 5"
            :key="`pagination-${i}`"
            :value="i"
            class="bigger-when-active"
          >
            {{ i }}
          </t-tab>
        </t-tabs>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.bigger-when-active.tab-active {
  @apply font-semibold drop-shadow-md border-2 rounded-lg
}
</style>
