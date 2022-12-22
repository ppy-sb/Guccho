<script setup lang="ts">
import { computed, provide, reactive, ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { useRoute } from '#app'
import type { Mode, OverallLeaderboardRankingSystem, Ruleset } from '~/types/common'
import { definePageMeta } from '#imports'
import type { UserModeRulesetStatistics } from '~/types/statistics'

// definePageMeta({
//   layout: 'without-bg',
// })

const route = useRoute()
const { $client } = useNuxtApp()
const _switcherContext = useSwitcher()
const [switcher] = _switcherContext
const {
  data: user,
  error,
  refresh,
} = await useAsyncData(async () => await $client.user.userpage.query({
  handle: `${route.params.handle}`,
}))
const currentStatistic = computed<UserModeRulesetStatistics<string, Mode, Ruleset, OverallLeaderboardRankingSystem>>(
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
  top: false,
  statistics: false,
  bests: false,
})
const [top, statistics, bests] = [ref(null), ref(null), ref(null)]
onMounted(() => {
  const stop = Object.entries({ top, statistics, bests }).map(([k, v]) => {
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
      class="flex flex-col pt-16 justify-stretch md:pt-0"
    >
      <userpage-heading id="top" ref="top" />
      <userpage-profile />
      <userpage-ranking-system-switcher class="z-10 !drop-shadow-xl" />
      <userpage-rank-chart v-if="currentRankingSystem" />
      <div class="lg:grid lg:grid-cols-7 xl:container xl:mx-auto">
        <div class="lg:col-span-6">
          <userpage-statistics
            id="statistics"
            ref="statistics"
          />
          <userpage-scores
            v-if="currentRankingSystem"
            id="bests"
            ref="bests"
          />
          <!-- <userpage-json-viewer
            id="json"
            ref="json"
          /> -->
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
                  'border-secondary dark:border-accent': isVisible,
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

<style lang="postcss" scoped>
.bg {
  @apply bg-gradient-to-b from-kimberly-50/50 to-kimberly-50/90 dark:from-kimberly-800 dark:to-kimberly-900;
  @apply min-h-screen
}
</style>
