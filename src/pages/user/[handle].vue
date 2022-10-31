<template>
  <div v-if="user" class="flex flex-col pt-16 justify-stretch md:pt-0">
    <userpage-head />
    <lazy-userpage-profile />
    <userpage-ranking-system-switcher class="z-10 !drop-shadow-xl" />
    <lazy-userpage-rank-chart v-if="currentRankingSystem" />
    <lazy-userpage-json-viewer />
  </div>
  <section v-else class="container flex flex-col justify-between mx-auto my-auto text-left gap-3 custom-container w-max">
    <h1 class="self-center text-3xl">
      oops..
    </h1>
    <h2 class="self-center text-2xl">
      This user is either been deleted or not exists.
    </h2>
    <div class="grid grid-cols-2 gap-2">
      <t-button variant="primary" @click="$router.back()">
        bring me back
      </t-button>
      <t-button variant="secondary">
        try again
      </t-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, provide, computed } from 'vue'
import { useRoute } from '#app'
import { Mode, Ruleset, RankingSystem } from '~/prototyping/types/shared'
import { useClient } from '#imports'
import { UserModeRulesetStatistics } from '~/prototyping/types/user'
const route = useRoute()
const client = useClient()
const _user = await client.query('user.full', {
  handle: `${route.params.handle}`
})
const user = ref(_user)

const tab = ref<RankingSystem>('ppv2')
const selectedMode = ref<Mode>('osu')
const selectedRuleset = ref<Ruleset>('standard')
const currentStatistic = computed<UserModeRulesetStatistics>(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  () => user.value?.statistics[selectedMode.value][selectedRuleset.value]
)

const currentRankingSystem = computed(
  () => currentStatistic.value?.ranking?.[tab.value]
)

provide('user', user)
provide('mode', selectedMode)
provide('ruleset', selectedRuleset)
provide('rankingSystem', tab)
provide('selectedStatisticsData', currentStatistic)
provide('selectedRankingSystemData', currentRankingSystem)
</script>
