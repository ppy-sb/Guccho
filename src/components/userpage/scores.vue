<script setup lang="ts">
import type { Ref } from 'vue'
import type { GrandLeaderboardRankingSystem, GrandLeaderboardScoreRankingSystem, NumberRange, PPRankingSystem, ScoreRankingSystem } from '~/types/common'
import { grandLeaderboardRankingSystem, grandLeaderboardScoreRankingSystem, mode, ruleset } from '~/types/common'
import type { Id } from '$active/config'

import type { UserEssential } from '~/types/user'
import type { SwitcherComposableType } from '~/composables/useSwitcher'
const { $client } = useNuxtApp()
const [switcher] = inject('switcher') as SwitcherComposableType
let prevSwitcherState = {
  ...switcher,
}
const stabilizeScoreRank = (rankingSystem: GrandLeaderboardRankingSystem) => {
  if (grandLeaderboardScoreRankingSystem.includes(rankingSystem as GrandLeaderboardScoreRankingSystem))
    return 'score' as ScoreRankingSystem
  return rankingSystem as PPRankingSystem
}
const switchBetweenScoreRanks = () => prevSwitcherState.rankingSystem !== switcher.rankingSystem && stabilizeScoreRank(prevSwitcherState.rankingSystem) === stabilizeScoreRank(switcher.rankingSystem)
const page = ref<NumberRange<0, 10>>(0)

const user = inject('user') as Ref<UserEssential<Id>>
const {
  data: current,
  error,
  refresh,
  pending,
} = await useAsyncData(async () => {
  if (!user.value || !switcher.mode || !switcher.ruleset || !switcher.rankingSystem) {
    return {
      result: [],
      handle: user.value.id,
      page: page.value,
      lastSwitcherStatus: {
        ...switcher,
      },
    }
  }
  return {
    result: await $client.user.best.query({
      handle: user.value.id,
      mode: switcher.mode,
      ruleset: switcher.ruleset,
      rankingSystem: switcher.rankingSystem as PPRankingSystem,
      page: page.value,
    }),
    handle: user.value.id,
    page: page.value,
    lastSwitcherStatus: {
      ...switcher,
    },
  }
})
watch([user, page], async () => {
  if (!user.value)
    return
  await refresh()
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
    rankingSystem: grandLeaderboardRankingSystem,
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
    page.value = 0
    // animate
    computeAnimateDirection()
    refresh()
    prevSwitcherState = { ...sw }
  })
})
const prevPage = () => {
  transition.value = 'left'
  if (page.value > 0)
    page.value -= 1
}
const nextPage = () => {
  transition.value = 'right'
  if (page.value < 9)
    page.value += 1
}
</script>

<template>
  <section class="custom-container">
    <div class="card" :class="[pending && 'pointer-events-none']">
      <div class="justify-center p-1 card-title rounded-2xl bg-kimberly-300/30">
        Top Performance
      </div>

      <div class="px-1 py-2 card-body">
        <div v-if="current" class="relative">
          <transition :name="transition">
            <ul :key="current.lastSwitcherStatus.mode + current.lastSwitcherStatus.ruleset + stabilizeScoreRank(current.lastSwitcherStatus.rankingSystem) + user.id + current.page">
              <li v-for="i in current.result" :key="`bests-${i.id}`" class="score">
                <app-score :score="i" :mode="current.lastSwitcherStatus.mode" :ruleset="current.lastSwitcherStatus.ruleset" :ranking-system="current.lastSwitcherStatus.rankingSystem" />
              </li>
            </ul>
          </transition>
        </div>
        <div v-else-if="error">
          {{ error }}
        </div>
      </div>

      <div class="btn-group d-flex w-full bg-kimberly-300/30 rounded-2xl shadow-xl" style="--rounded-btn: 1rem">
        <button class="btn btn-ghost !shadow-none" @click="prevPage">
          «
        </button>
        <button class="btn btn-ghost !shadow-none grow" @click="() => refresh()">
          Page {{ page + 1 }}
        </button>
        <button class="btn btn-ghost !shadow-none" @click="nextPage">
          »
        </button>
      </div>
    </div>
  </section>
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
