<template>
  <div v-if="user" class="flex flex-col pt-16 justify-stretch md:pt-0">
    <userpage-head />
    <lazy-userpage-profile />
    <userpage-ranking-system-switcher class="z-10 !drop-shadow-xl" />
    <lazy-userpage-rank-chart v-if="currentRankingSystem" />
    <lazy-userpage-json-viewer />
  </div>
  <section v-else class="container flex flex-col gap-3 justify-between mx-auto my-auto text-left custom-container w-max">
    <h1 class="text-3xl self-center">
      oops..
    </h1>
    <h2 class="text-2xl self-center">
      This user is either been deleted or not exists.
    </h2>
    <div class="grid grid-cols-2 gap-2">
      <t-button variant="primary">
        take me back
      </t-button>
      <t-button variant="secondary">
        refresh
      </t-button>
    </div>
  </section>
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
