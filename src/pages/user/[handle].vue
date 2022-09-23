<template>
  <div>
    <userpage-head />

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
// const { rankingSystem } = useAppConfig()
provide('user', user)
provide('mode', selectedMode)
provide('ruleset', selectedRuleset)
provide('rankingSystem', tab)
provide('selectedStatisticsData', currentStatistic)
provide('selectedRankingSystemData', currentRankingSystem)
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
