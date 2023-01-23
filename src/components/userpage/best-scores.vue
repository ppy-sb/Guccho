<script setup lang="ts">
import type { Ref } from 'vue'
import type { NumberRange, OverallLeaderboardRankingSystem, OverallLeaderboardScoreRankingSystem, PPRankingSystem, ScoreRankingSystem } from '~/types/common'
import { mode, overallLeaderboardRankingSystem, overallLeaderboardScoreRankingSystem, ruleset } from '~/types/common'

import type { UserEssential } from '~/types/user'
import type { OverallSwitcherComposableType } from '~/composables/useSwitcher'
const { $client } = useNuxtApp()
const [switcher] = inject('switcher') as OverallSwitcherComposableType
let prevSwitcherState = {
  ...switcher,
}
const stabilizeScoreRank = (rankingSystem: OverallLeaderboardRankingSystem) => {
  if (overallLeaderboardScoreRankingSystem.includes(rankingSystem as OverallLeaderboardScoreRankingSystem))
    return 'score' as ScoreRankingSystem
  return rankingSystem as PPRankingSystem
}
const switchBetweenScoreRanks = () => prevSwitcherState.rankingSystem !== switcher.rankingSystem && stabilizeScoreRank(prevSwitcherState.rankingSystem) === stabilizeScoreRank(switcher.rankingSystem)
const bpPage = ref<NumberRange<0, 10>>(0)
const topPage = ref<NumberRange<0, 10>>(0)

const user = inject('user') as Ref<UserEssential<string>>
const {
  data: bp,
  error: bpError,
  refresh: refreshBP,
  pending: pendingBP,
} = await useAsyncData(async () => {
  if (!user.value || !switcher.mode || !switcher.ruleset || !switcher.rankingSystem) {
    return {
      scores: [],
      handle: user.value.id,
      bpPage: bpPage.value,
      lastSwitcherStatus: {
        ...switcher,
      },
    }
  }
  return {
    scores: await $client.user.best.query({
      handle: user.value.id,
      mode: switcher.mode,
      ruleset: switcher.ruleset,
      rankingSystem: switcher.rankingSystem as PPRankingSystem,
      page: bpPage.value,
    }),
    page: bpPage.value,
    handle: user.value.id,
    lastSwitcherStatus: {
      ...switcher,
    },
  }
})
watch([user, bpPage], async () => {
  if (!user.value)
    return
  await refreshBP()
})

const transition = ref<'left' | 'right'>('left')
onMounted(() => {
  const animationDirection = <T extends readonly any[]>(val: T[number], prevVal: T[number], array: T) => {
    const [idx, prevIdx] = [array.indexOf(val), array.indexOf(prevVal)]
    if (idx === prevIdx)
      return
    if (idx > prevIdx)
      return 'right'
    else
      return 'left'
  }

  // transition direction
  const arrayMap = {
    mode,
    ruleset,
    rankingSystem: overallLeaderboardRankingSystem,
  } as const
  const computeAnimateDirection = () => {
    const sw = switcher

    for (const [key, switcherState] of Object.entries(sw)) {
      const [value, previousValue] = [switcherState, prevSwitcherState[key as keyof typeof prevSwitcherState]]
      const direction = animationDirection(value, previousValue, arrayMap[key as keyof typeof prevSwitcherState])
      if (!direction)
        continue
      transition.value = direction
      break
    }
  }
  watch(switcher, (sw) => {
    if (switchBetweenScoreRanks()) {
      prevSwitcherState = { ...sw }
      return
    }
    // reset bp page
    bpPage.value = 0
    topPage.value = 0
    // animate
    computeAnimateDirection()
    refreshBP()
    prevSwitcherState = { ...sw }
  })
})
const prevPage = (val: Ref<any>) => () => {
  transition.value = 'left'
  if (val.value > 0)
    val.value -= 1
}
const nextPage = (val: Ref<any>) => () => {
  transition.value = 'right'
  if (val.value < 9)
    val.value += 1
}

const prevBp = prevPage(bpPage)
const nextBp = nextPage(bpPage)
</script>

<template>
  <div v-if="bpError">
    {{ bpError }}
  </div>
  <template v-else>
    <div class="flex flex-col gap-6">
      <section v-if="bp?.scores?.length" class="custom-container">
        <div class="card" :class="[pendingBP && 'pointer-events-none']">
          <div class="justify-center p-1 card-title rounded-2xl bg-kimberly-300/30">
            Best Scores
          </div>
          <div
            class="px-1 py-2 card-body transition-[filter] transition-opacity duration-200"
            :class="{
              'saturate-50 opacity-30 blur-sm': pendingBP,
            }"
          >
            <div class="relative">
              <transition :name="transition">
                <ul :key="bp.lastSwitcherStatus.mode + bp.lastSwitcherStatus.ruleset + stabilizeScoreRank(bp.lastSwitcherStatus.rankingSystem) + user.id + bp.page">
                  <li v-for="i in bp.scores" :key="`bests-${i.id}`" class="score">
                    <app-score-list-item :score="i" :mode="bp.lastSwitcherStatus.mode" :ruleset="bp.lastSwitcherStatus.ruleset" :ranking-system="bp.lastSwitcherStatus.rankingSystem" />
                  </li>
                </ul>
              </transition>
            </div>
          </div>
          <div class="btn-group d-flex w-full bg-kimberly-300/30 rounded-2xl shadow-xl" style="--rounded-btn: 1rem">
            <button class="btn btn-ghost" :disabled="bpPage === 0" @click="prevBp">
              «
            </button>
            <button class="btn btn-ghost grow" @click="() => refreshBP()">
              Page {{ bpPage + 1 }}
            </button>
            <button class="btn btn-ghost" :disabled="bp.scores.length < 10" @click="nextBp">
              »
            </button>
          </div>
        </div>
      </section>
      <div v-else-if="!bp?.scores.length && pendingBP" class="custom-container">
        Loading Best Scores...
      </div>
    </div>
  </template>
</template>

<style scoped lang="postcss">
.left-move,
.right-move,
/* apply transition to moving elements */
.left-enter-active,
.right-enter-active,
.left-leave-active,
.right-leave-active {
  transition: all 0.25s ease;
}

.left-enter-from,
.right-enter-from,
.left-leave-to,
.right-leave-to {
  filter: opacity(0) blur(2px);
}
.left-enter-from {
  transform: translateX(-2%) translateY(1%);
}
.left-leave-to{
  transform: translateX(2%) translateY(1%);
}
.right-enter-from {
  transform: translateX(2%) translateY(1%);
}
.right-leave-to{
  transform: translateX(-2%) translateY(1%);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.left-leave-active,
.right-leave-active {
  @apply absolute left-0 right-0 -z-10;
}
</style>