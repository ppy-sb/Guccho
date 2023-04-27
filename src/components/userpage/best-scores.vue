<script setup lang="ts">
import type { Ref } from 'vue'

import { faPiedPiperPp } from '@fortawesome/free-brands-svg-icons'
import type {
  LeaderboardRankingSystem,
  LeaderboardScoreRankingSystem,
  NumberRange,
  PPRankingSystem,
  ScoreRankingSystem,
} from '~/types/common'
import {
  leaderboardRankingSystems,
  leaderboardScoreRankingSystems,
  modes,
  rulesets,
} from '~/types/defs'

import userpageStore from '~/store/userpage'

const { addToLibrary } = useFAIcon()

addToLibrary(faPiedPiperPp)
const app$ = useNuxtApp()

const page = userpageStore()

let prevSwitcherState: UnwrapShallowReactive<typeof page['switcher']> = {
  ...page.switcher,
}
function stabilizeScoreRank(rankingSystem: LeaderboardRankingSystem) {
  if (
    leaderboardScoreRankingSystems.includes(rankingSystem as LeaderboardScoreRankingSystem)
  ) {
    return 'score' as ScoreRankingSystem
  }
  return rankingSystem as PPRankingSystem
}
function switchBetweenScoreRanks() {
  return prevSwitcherState.rankingSystem !== page.switcher.rankingSystem
  && stabilizeScoreRank(prevSwitcherState.rankingSystem)
    === stabilizeScoreRank(page.switcher.rankingSystem)
}
const bpPage = shallowRef<NumberRange<0, 10>>(0)

const {
  data: bp,
  error: bpError,
  refresh: refreshBP,
  pending: pendingBP,
} = await useAsyncData(async () => {
  if (
    !page.user
    || !page.switcher.mode
    || !page.switcher.ruleset
    || !page.switcher.rankingSystem
  ) {
    return {
      scores: [],
      handle: page.user?.id,
      bpPage: bpPage.value,
      lastSwitcherStatus: {
        ...page.switcher,
      },
    }
  }
  return {
    scores: await app$.$client.user.best.query({
      handle: page.user.id,
      mode: page.switcher.mode,
      ruleset: page.switcher.ruleset,
      rankingSystem: page.switcher.rankingSystem,
      page: bpPage.value,
    }),
    page: bpPage.value,
    handle: page.user.id,
    lastSwitcherStatus: {
      ...page.switcher,
    },
  }
})
watch([() => page.user, bpPage], async () => {
  if (!page.user) {
    return
  }
  await refreshBP()
})

const transition = shallowRef<'left' | 'right'>('left')
onMounted(() => {
  const animationDirection = <T extends readonly any[]>(
    val: T[number],
    prevVal: T[number],
    array: T
  ) => {
    const [idx, prevIdx] = [array.indexOf(val), array.indexOf(prevVal)]
    if (idx === prevIdx) {
      return
    }
    if (idx > prevIdx) {
      return 'right'
    }
    else {
      return 'left'
    }
  }

  // transition direction
  const arrayMap = {
    mode: modes,
    ruleset: rulesets,
    rankingSystem: leaderboardRankingSystems,
  } as const
  const computeAnimateDirection = () => {
    const sw = page.switcher

    for (const [key, switcherState] of Object.entries(sw)) {
      const [value, previousValue] = [
        switcherState,
        prevSwitcherState[key as keyof typeof prevSwitcherState],
      ]
      const direction = animationDirection(
        value,
        previousValue,
        arrayMap[key as keyof typeof prevSwitcherState]
      )
      if (!direction) {
        continue
      }
      transition.value = direction
      break
    }
  }
  watch(page.switcher, (sw) => {
    if (switchBetweenScoreRanks()) {
      prevSwitcherState = { ...sw }
      return
    }
    // reset bp page
    bpPage.value = 0
    // animate
    computeAnimateDirection()
    refreshBP()
    prevSwitcherState = { ...sw }
  })
})
function prevPage(val: Ref<number>) {
  transition.value = 'left'
  if (val.value > 0) {
    val.value -= 1
  }
}
function nextPage(val: Ref<number>) {
  transition.value = 'right'
  if (val.value < 9) {
    val.value += 1
  }
}

const prevBp = prevPage.bind(null, bpPage)
const nextBp = nextPage.bind(null, bpPage)
</script>

<template>
  <div v-if="bpError">
    {{ bpError }}
  </div>
  <template v-else-if="page.user">
    <div class="flex flex-col gap-6">
      <section v-if="bp?.scores?.length" class="custom-container">
        <div class="card" :class="[pendingBP && 'pointer-events-none']">
          <div
            class="p-1 two-tone flex items-center w-100"
          >
            <font-awesome-icon icon="fa-brands fa-pied-piper-pp" class="text-4xl w-1/6 opacity-70" />
            <div class="w-2/3 flex">
              <div class="text-3xl font-semibold mx-auto">
                Best Scores
              </div>
            </div>
          </div>
          <div
            class="px-1 py-2 card-body transition-[filter] transition-opacity duration-200"
            :class="{
              'saturate-50 opacity-30 blur-sm': pendingBP,
            }"
          >
            <div class="relative">
              <transition :name="transition">
                <ul
                  :key="
                    bp.lastSwitcherStatus.mode
                      + bp.lastSwitcherStatus.ruleset
                      + stabilizeScoreRank(bp.lastSwitcherStatus.rankingSystem)
                      + page.user.id
                      + bp.page
                  "
                >
                  <li
                    v-for="i in bp.scores"
                    :key="`bests-${i.id}`"
                    class="score"
                  >
                    <app-score-list-item
                      :score="i"
                      :mode="bp.lastSwitcherStatus.mode"
                      :ruleset="bp.lastSwitcherStatus.ruleset"
                      :ranking-system="bp.lastSwitcherStatus.rankingSystem"
                    />
                  </li>
                </ul>
              </transition>
            </div>
          </div>
          <div
            class="btn-group d-flex w-full bg-gbase-300/30 dark:bg-gbase-700/50 rounded-2xl shadow"
            style="--rounded-btn: 1rem"
          >
            <button
              class="btn btn-ghost"
              :disabled="bpPage === 0"
              @click="prevBp"
            >
              «
            </button>
            <button class="btn btn-ghost grow" @click="() => refreshBP()">
              Page {{ bpPage + 1 }}
            </button>
            <button
              class="btn btn-ghost"
              :disabled="bp.scores.length < 10"
              @click="nextBp"
            >
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
