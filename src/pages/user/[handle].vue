<template>
  <div class="flex flex-col justify-stretch">
    <userpage-head />
    <userpage-profile />
    <userpage-ranking-system-switcher class="z-10 !drop-shadow-xl" />
    <lazy-userpage-rank-chart v-if="currentRankingSystem" />
    <lazy-userpage-json-viewer />
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, provide, computed } from 'vue'
// import { useAppConfig } from '#app'
import { scoped } from '@/prototyping/objects/user'
import { Mode, Ruleset } from '~/prototyping/types/shared'
const user = computed(() => scoped.demoUser)
const tab = ref('ppv2')
const selectedMode:Ref<Mode> = ref('osu')
const selectedRuleset: Ref<Ruleset> = ref('standard')
const currentStatistic = computed(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  () => user.value.statistics[selectedMode.value][selectedRuleset.value]
)

const currentRankingSystem = computed(() => currentStatistic.value?.ranking?.[tab.value])

provide('user', user)
provide('mode', selectedMode)
provide('ruleset', selectedRuleset)
provide('rankingSystem', tab)
provide('selectedStatisticsData', currentStatistic)
provide('selectedRankingSystemData', currentRankingSystem)
</script>
