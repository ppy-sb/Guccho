<script setup lang="ts">
import { computed, provide, reactive, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { faBarsStaggered, faHouseUser, faRankingStar } from '@fortawesome/free-solid-svg-icons'
import { faPiedPiperPp } from '@fortawesome/free-brands-svg-icons'
import type { OverallLeaderboardRankingSystem } from '~/types/common'
import type { UserModeRulesetStatistics } from '~/types/statistics'

const { addToLibrary } = useFAIconLib()

addToLibrary(faRankingStar, faPiedPiperPp, faBarsStaggered, faHouseUser)

definePageMeta({
  layout: 'without-footer',
})

const route = useRoute()
const { $client } = useNuxtApp()
const _switcherContext = useOverallSwitcher()
const [switcher] = _switcherContext
const {
  data: user,
  error,
  refresh,
} = await useAsyncData(async () => await $client.user.userpage.query({
  handle: `${route.params.handle}`,
}))
const currentStatistic = computed<UserModeRulesetStatistics<OverallLeaderboardRankingSystem>>(
  // @ts-expect-error switcher has its logic to not spit out wrong combination
  () => user.value?.statistics[switcher.mode][switcher.ruleset],
)
const currentRankingSystem = computed(
  () => currentStatistic.value?.[switcher.rankingSystem],
)
provide('user', user)
provide('switcher', _switcherContext)

provide('user.statistics', currentStatistic)
provide('user.currentRankingSystem', currentRankingSystem)

// directive is not working: yield error when navigate to other page
const visible = reactive({
  heading: false,
  statistics: false,
  bestScores: false,
  topScores: false,
})
const icons: Partial<Record<keyof typeof visible, string>> = {
  topScores: 'fa-solid fa-ranking-star',
  bestScores: 'fa-brands fa-pied-piper-pp',
  statistics: 'fa-solid fa-bars-staggered',
  heading: 'fa-solid fa-house-user',
}
const [heading, statistics, bestScores, topScores] = [ref(null), ref(null), ref(null), ref(null)]
onMounted(() => {
  const stop = Object.entries({ heading, statistics, bestScores, topScores }).map(([k, v]) => {
    if (!v.value)
      return undefined
    const { stop } = useIntersectionObserver(
      v,
      ([{ isIntersecting }]) => {
        visible[k as keyof typeof visible] = isIntersecting
      },
    )
    return stop
  })
  onBeforeUnmount(() => {
    stop.forEach(item => item?.())
  })
})
</script>

<template>
  <div class="absolute w-full">
    <section
      v-if="error"
      class="min-h-screen grid"
    >
      <div class="mx-auto my-auto flex flex-col justify-between gap-3">
        <h1 class="self-center text-3xl">
          Oops...
        </h1>
        <h2
          v-if="error.message !== ''"
          class="self-center text-2xl"
        >
          {{ error.message }}
        </h2>
        <h2
          v-else
          class="self-center text-2xl"
        >
          something went wrong.
        </h2>
        <div class="grid grid-cols-2 gap-2">
          <t-button
            variant="primary"
            @click="$router.back()"
          >
            bring me back
          </t-button>
          <t-button
            variant="secondary"
            @click="refresh"
          >
            try again
          </t-button>
        </div>
      </div>
    </section>
    <div
      v-else-if="user"
      class="flex flex-col pt-20 justify-stretch md:pt-0"
    >
      <userpage-heading id="heading" ref="heading" />
      <userpage-profile />
      <userpage-ranking-system-switcher class="z-10 !drop-shadow-xl" />
      <div class="container custom-container mx-auto">
        <userpage-statistics
          id="statistics"
          ref="statistics"
        />
        <userpage-score-rank-composition />
      </div>
      <div id="bestScores" ref="bestScores" class="container custom-container mx-auto py-2">
        <userpage-best-scores
          v-if="currentRankingSystem"
        />
      </div>
      <div id="topScores" ref="topScores" class="container custom-container mx-auto py-2">
        <userpage-top-scores
          v-if="currentRankingSystem"
        />
      </div>
      <div class="pt-4" />
      <!-- <userpage-rank-chart v-if="currentRankingSystem" /> -->
      <!-- <div class="lg:grid lg:grid-cols-7 xl:container xl:mx-auto lg:px-4">
        <div class="lg:col-span-6">

        </div>
        <div class="hidden self-start lg:block lg:col-span-1 sticky top-[100px]">
          <ul class="menu menu-compact drop-shadow-xl">
            <li
              v-for="(isVisible, el) of visible"
              :key="el"
            >
              <a
                class="border-kimberly-500/20 w-full grow border-r-4"
                :class="{
                  'border-secondary dark:border-accent': isVisible,
                }"
                :href="`#${el}`"
              >{{ el }}</a>
            </li>
          </ul>
        </div>
      </div> -->
      <!-- placeholder for bottom nav -->
      <div class="py-8 -z-50" />
    </div>
    <teleport to="body">
      <div class="btm-nav z-10">
        <!-- <button>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <button class="active">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        </button> -->
        <template
          v-for="(isVisible, el) of visible"
          :key="el"
        >
          <a
            v-if="icons[el]" :class="{
              active: isVisible,
            }" :href="`#${el}`"
          >
            <font-awesome-icon :icon="icons[el]" class="fa-xl" />
          </a>
          <a
            v-else
            :class="{
              active: isVisible,
            }"
            :href="`#${el}`"
          >
            {{ el }}
          </a>
        </template>
      </div>
    </teleport>
  </div>
</template>

<style lang="postcss" scoped>
.bg {
  @apply bg-gradient-to-b from-kimberly-50/50 to-kimberly-50/90 dark:from-kimberly-800 dark:to-kimberly-900;
  @apply min-h-screen
}
</style>
