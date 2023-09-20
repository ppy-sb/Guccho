<script setup lang="ts">
import type { LeaderboardRankingSystem } from '~/def/common'
import userpageStore from '~/store/userpage'

const { hasRuleset, hasLeaderboardRankingSystem } = await useAdapterConfig()
const config = useAppConfig()
const { t } = useI18n()
const rankingSystem = config.leaderboardRankingSystem

const page = userpageStore()

interface RankConf {
  userpage: {
    show: string
  }
  name: string
  icon: string
}
type Entry = [keyof typeof rankingSystem, RankConf]
const rankingSystemEntries = computed(
  () => Object.entries(rankingSystem) as Entry[],
)

function filter(showType: 'tab' | 'dropdown') {
  return rankingSystemEntries.value.reduce((acc, [key, value]) => {
    if (value.userpage.show !== showType) {
      return acc
    }
    if (
      !hasRuleset(page.switcher.mode, page.switcher.ruleset)
      || !hasLeaderboardRankingSystem(page.switcher.mode, page.switcher.ruleset, key)
    ) {
      return acc
    }
    acc[key] = value
    return acc
  }, {} as Partial<Record<keyof typeof rankingSystem, RankConf>>)
}
const tabs = computed(() => filter('tab'))
const dropdown = computed(() => filter('dropdown'))
</script>

<i18n lang="yaml">
en-GB:
  folded-ranking-system: Other Ranks

zh-CN:
  folded-ranking-system: Other Ranks

fr-FR:
  folded-ranking-system: Autres Classements
</i18n>

<template>
  <section class="w-full pt-4 mx-auto">
    <t-tabs
      v-slot="{ select }"
      :model-value="page.switcher.rankingSystem"
      variant="bordered"
      @update:model-value="(v: LeaderboardRankingSystem) => page.setSwitcher({ rankingSystem: v })"
    >
      <t-tab disabled class="p-0 m-0 f-tab grow" />
      <!-- <t-tab class="f-tab" value="Timeline">
        Timeline
      </t-tab> -->

      <t-tab
        v-for="(_stats, key) of tabs"
        :key="`user-tab-${key}`"
        class="f-tab"
        :value="key"
      >
        {{ $t(localeKey.rankingSystem(key)) }}
      </t-tab>

      <div
        v-if="Object.keys(dropdown).length"
        class="tab f-tab tab-bordered"
        :active="
          page.switcher.rankingSystem
            && Object.keys(dropdown).includes(page.switcher.rankingSystem)
        "
      >
        <div class="dropdown dropdown-end dropdown-hover">
          <div tabindex="0">
            {{ t('folded-ranking-system') }}
          </div>
          <ul
            tabindex="0"
            class="z-50 p-2 shadow dropdown-content menu bg-gbase-100 rounded-box rounded-3xl w-52"
          >
            <li v-for="(_stats, key) of dropdown" :key="`user-tab-${key}`">
              <a class="z-50" @click="select(key)">{{
                $t(localeKey.rankingSystem(key))
              }}</a>
            </li>
          </ul>
        </div>
      </div>
      <t-tab disabled class="p-0 m-0 f-tab grow" />
    </t-tabs>
  </section>
</template>

<style lang="postcss" scoped>
.f-tab {
  @apply tab-sm sm:tab-sm md:tab-lg;
}
</style>
