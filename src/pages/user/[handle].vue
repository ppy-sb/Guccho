<template>
  <div>
    <userpage-head />
    <userpage-ranking-system-switcher />
    <userpage-rank-chart />
    <div class="pt-20">
      <userpage-json-viewer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, provide, computed } from 'vue'
// import { useAppConfig } from '#app'
import { demoUser as user } from '@/prototyping/objects/user'
import { Mode, Ruleset } from '~~/src/prototyping/types/shared'

const tab = ref('ppv2')
const selectedMode:Ref<Mode> = ref('osu')
const selectedRuleset: Ref<Ruleset> = ref('standard')
const currentStatistic = computed(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  () => user.statistics[selectedMode.value][selectedRuleset.value]
)

const currentRankingSystem = computed(() => currentStatistic.value?.ranking?.[tab.value])

provide('user', user)
provide('mode', selectedMode)
provide('ruleset', selectedRuleset)
provide('rankingSystem', tab)
provide('selectedStatisticsData', currentStatistic)
provide('selectedRankingSystemData', currentRankingSystem)
</script>
