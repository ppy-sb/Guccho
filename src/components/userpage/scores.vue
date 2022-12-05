<script setup lang="ts">
import type { Ref } from 'vue'
import type { PPRankingSystem, Range } from '~/types/common'
import { mode, rankingSystem, ruleset } from '~/types/common'
import type { IdType } from '$/config'

import type { BaseUser } from '~/types/user'
import type { SwitcherComposableType } from '~/composables/useSwitcher'
const { $client } = useNuxtApp()
const user = inject('user') as Ref<BaseUser<IdType>>
const [switcher] = inject('switcher') as SwitcherComposableType

const page = ref<Range<0, 10>>(0)
const {
  data: bp,
  error,
  refresh,
  pending,
} = useAsyncData(async () => {
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
watch([user, switcher, page], async () => {
  if (!user.value || !switcher.mode || !switcher.ruleset || !switcher.rankingSystem)
    return
  await refresh()
})
const transition = ref<'left' | 'right'>('left')
// transition direction
const arrayMap = {
  mode,
  ruleset,
  rankingSystem,
} as const
let prevSw = {
  ...switcher,
}
watch(switcher, (sw) => {
  const animationDirection = <T extends readonly any[]>(val: T[number], prevVal: T[number], array: T) => {
    const [idx, prevIdx] = [array.indexOf(val), array.indexOf(prevVal)]
    if (idx === prevIdx)
      return
    if (idx > prevIdx)
      return 'right'
    else
      return 'left'
  }
  for (const [key, value] of Object.entries(sw)) {
    const [v, pV] = [value, prevSw[key as keyof typeof prevSw]]
    const direction = animationDirection(v, pV, arrayMap[key as keyof typeof prevSw])
    if (!direction)
      continue
    transition.value = direction
    break
  }
  prevSw = { ...sw }
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
    <div class="shadow-lg card bg-kimberly-300/30" :class="[pending && 'pointer-events-none']">
      <div class="justify-center p-2 card-title">
        Top Performance
      </div>

      <div class="p-4 card-body">
        <div v-if="bp" class="relative">
          <transition :name="transition">
            <ul :key="switcher.mode + switcher.ruleset + switcher.rankingSystem + user.id + bp.page">
              <li v-for="i in bp.result" :key="`bests-${i.id}`" class="score">
                <app-score :score="i" :mode="bp.lastSwitcherStatus.mode" :ruleset="bp.lastSwitcherStatus.ruleset" :ranking-system="bp.lastSwitcherStatus.rankingSystem" />
              </li>
            </ul>
          </transition>
        </div>
        <div v-else-if="error">
          {{ error }}
        </div>
      </div>

      <div class="btn-group d-flex w-full">
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
  transition: all 0.2s ease;
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
