<template>
  <div class="absolute w-full">
    <section v-if="error" class="min-h-screen grid bg">
      <div class="mx-auto my-auto flex flex-col justify-between gap-3">
        <h1 class="self-center text-3xl">
          Oops...
        </h1>
        <h2 v-if="error.message !== ''" class="self-center text-2xl">
          {{ error.message }}
        </h2>
        <h2 v-else class="self-center text-2xl">
          something went wrong.
        </h2>
        <div class="grid grid-cols-2 gap-2">
          <t-button variant="primary" @click="$router.back()">
            bring me back
          </t-button>
          <t-button variant="secondary" @click="refresh">
            try again
          </t-button>
        </div>
      </div>
    </section>
    <div v-else-if="user" class="flex flex-col pt-16 justify-stretch md:pt-0 bg">
      <lazy-userpage-head />
      <lazy-userpage-profile />
      <lazy-userpage-ranking-system-switcher class="z-10 !drop-shadow-xl" />
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
                class="border-kimberly-500/20 border-l-4"
                :class="{
                  'border-secondary dark:border-accent': isVisible
                }"
                :href="`#${el}`"
              >{{ el }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, computed, reactive } from 'vue'
import { useRoute } from '#app'
import { vIntersectionObserver } from '@vueuse/components'
import { Mode, Ruleset, RankingSystem } from '~/types/shared'
import { definePageMeta, /* useClient, */ useAsyncQuery } from '#imports'
import { UserModeRulesetStatistics } from '~/types/user'

const route = useRoute()
// const client = useClient()

const visible = reactive({
  statistics: false,
  bests: false,
  json: false
})

const updateIntersectingStatus = (key:keyof typeof visible) => ([{ isIntersecting }]: [{isIntersecting: boolean}]) => {
  visible[key] = isIntersecting
}

// const _user = await client.query('public.user.userpage', {
//   handle: `${route.params.handle}`
// })
// const user = ref(_user)
const {
  data: user,
  error,
  refresh
} = await useAsyncQuery(['public.user.userpage', { handle: `${route.params.handle}` }], {
  // pass useAsyncData options here
  lazy: false
})

definePageMeta({
  layout: 'default'
})

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

// const smoothScrollTo = (el: string) => {
//   const selector = `#${el}`
//   document.querySelector(selector)?.scrollIntoView({
//     behavior: 'smooth'
//   })
// }

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
