<script setup lang="ts">
import type { Ref } from 'vue'
import type { Mode, PPRankingSystem, Range, RankingSystem, Ruleset } from '~/types/common'
import type { IdType } from '$/config'

import type { BaseUser } from '~/types/user'
import { rankingSystem as allRankingSystems } from '~/types/common'
const { $client } = useNuxtApp()
const user = inject('user') as Ref<BaseUser<IdType>>
const mode = inject('mode') as Ref<Mode>
const ruleset = inject('ruleset') as Ref<Ruleset>
const rankingSystem = inject('rankingSystem') as Ref<RankingSystem>

const page = ref<Range<0, 10>>(0)
const {
  data: bp,
  error,
  refresh,
  pending,
} = useAsyncData(async () => {
  if (!user.value || !mode.value || !ruleset.value || !rankingSystem.value) {
    return {
      result: [],
      handle: user.value.id,
      mode: mode.value,
      ruleset: ruleset.value,
      rankingSystem: rankingSystem?.value as PPRankingSystem,
      page: page.value,
    }
  }
  return {
    result: await $client.user.best.query({
      handle: user.value.id,
      mode: mode.value,
      ruleset: ruleset.value,
      rankingSystem: rankingSystem?.value as PPRankingSystem,
      page: page.value,
    }),
    handle: user.value.id,
    mode: mode.value,
    ruleset: ruleset.value,
    rankingSystem: rankingSystem?.value as PPRankingSystem,
    page: page.value,
  }
})
watch([user, mode, ruleset, rankingSystem, page], async () => {
  if (!user.value || !mode.value || !ruleset.value || !rankingSystem.value)
    return
  await refresh()
})
const transition = ref<'left' | 'right'>('left')
watch(rankingSystem, (rs, prevRs) => {
  const [idx, prevIdx] = [allRankingSystems.indexOf(rs), allRankingSystems.indexOf(prevRs)]
  if (idx > prevIdx)
    transition.value = 'left'
  else
    transition.value = 'right'
})
const prevPage = () => {
  transition.value = 'right'
  if (page.value > 0)
    page.value -= 1
}
const nextPage = () => {
  transition.value = 'left'
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
            <ul :key="mode + ruleset + rankingSystem + user.id + bp.page">
              <li v-for="i in bp.result" :key="`bests-${i.id}`" class="score">
                <app-score :score="i" :mode="bp.mode" :ruleset="bp.ruleset" :ranking-system="bp.rankingSystem" />
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
.right-enter-from {
  transform: translateX(-2%) translateY(1%);
}
.right-leave-to{
  transform: translateX(2%) translateY(1%);
}
.left-enter-from {
  transform: translateX(2%) translateY(1%);
}
.left-leave-to{
  transform: translateX(-2%) translateY(1%);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.left-leave-active,
.right-leave-active {
  @apply absolute left-0 right-0 -z-10;
}
</style>
