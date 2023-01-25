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
  // @ts-expect-error switcher has its logic to not allow wrong combination
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

      <!-- placeholder for bottom nav -->
      <div class="py-8 -z-50" />
    </div>
    <div class="btm-nav sticky">
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
  </div>
</template>

<style lang="postcss" scoped>
.bg {
  @apply bg-gradient-to-b from-kimberly-50/50 to-kimberly-50/90 dark:from-kimberly-800 dark:to-kimberly-900;
  @apply min-h-screen
}
</style>
