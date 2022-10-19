<template>
  <div v-if="user" class="flex flex-col justify-stretch pt-16 md:pt-0">
    <userpage-head />
    <lazy-userpage-profile />
    <userpage-ranking-system-switcher class="z-10 !drop-shadow-xl" />
    <lazy-userpage-rank-chart v-if="currentRankingSystem" />
    <lazy-userpage-json-viewer />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, provide, computed } from 'vue'
import { useRoute } from '#app'
import { Mode, Ruleset } from '~/prototyping/types/shared'
import { useClient } from '#imports'
const route = useRoute()
const client = useClient()
const _user = await client.query('getFullUser', {
  handle: `${route.params.handle}`
})
const user = ref(_user)

const tab = ref('ppv2')
const selectedMode: Ref<Mode> = ref('osu')
const selectedRuleset: Ref<Ruleset> = ref('standard')
const currentStatistic = computed(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  () => user.value.statistics[selectedMode.value][selectedRuleset.value]
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
