<template>
  <div class="absolute w-full">
    <div v-if="user" class="flex flex-col pt-16 justify-stretch md:pt-0 bg">
      <userpage-head />
      <lazy-userpage-profile />
      <userpage-ranking-system-switcher class="z-10 !drop-shadow-xl" />
      <lazy-userpage-rank-chart v-if="currentRankingSystem" />
      <div class="lg:grid lg:grid-cols-7 xl:container xl:mx-auto">
        <div class="lg:col-span-6">
          <lazy-userpage-statistics
            id="statistics"
            v-intersection-observer="updateIntersectingStatus('statistics')"
          />
          <lazy-userpage-scores v-if="currentRankingSystem" id="bests" v-intersection-observer="updateIntersectingStatus('bests')" />
          <lazy-userpage-json-viewer id="json" v-intersection-observer="updateIntersectingStatus('json')" />
        </div>
        <div class="hidden self-start lg:block lg:col-span-1 sticky top-[100px]">
          <ul class="menu menu-compact drop-shadow-xl">
            <li
              v-for="(isVisible, el) of visible"
              :key="el"
            >
              <a
                class="border-kimberly-500/20 border-l-2"
                :class="{
                  'border-accent': isVisible
                }"
                :href="`#${el}`"
              >{{ el }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <section v-else class="container flex flex-col justify-between mx-auto my-auto text-left gap-3 custom-container w-max bg">
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
  </div>
</template>

<script setup lang="ts">
import { ref, provide, computed, reactive } from 'vue'
import { useRoute } from '#app'
import { vIntersectionObserver } from '@vueuse/components'
import { Mode, Ruleset, RankingSystem } from '~/prototyping/types/shared'
import { definePageMeta, useClient } from '#imports'
import { UserModeRulesetStatistics } from '~/prototyping/types/user'

definePageMeta({
  layout: 'without-bg'
})
const route = useRoute()
const client = useClient()

const visible = reactive({
  statistics: false,
  bests: false,
  json: false
})

const updateIntersectingStatus = (key:keyof typeof visible) => ([{ isIntersecting }]: [{isIntersecting: boolean}]) => {
  visible[key] = isIntersecting
}

const _user = await client.query('user.userpage', {
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

<style lang="postcss" scoped>
.bg {
  @apply bg-gradient-to-b from-kimberly-50 to-kimberly-150/80 dark:from-kimberly-800 dark:to-kimberly-900
}
</style>
