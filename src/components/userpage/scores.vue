<script setup lang="ts">
import type { Ref } from 'vue'
import type { Mode, PPRankingSystem, Range, RankingSystem, Ruleset } from '~/types/common'
import type { IdType } from '$/config'

import type { BaseUser } from '~/types/user'
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
} = useAsyncData(async () => {
  // if (user && mode && ruleset && ['ppv2', 'ppv1'].includes(rankingSystem?.value as string))
  //   return []
  return await $client.user.best.query({
    handle: user.value.id,
    mode: mode.value,
    ruleset: ruleset.value,
    rankingSystem: rankingSystem?.value as PPRankingSystem,
    page: page.value,
  })
})

watch([user, mode, ruleset, rankingSystem, page], refresh)
const prevPage = () => {
  if (page.value >= 1)
    page.value -= 1
}
const nextPage = () => {
  if (page.value <= 9)
    page.value = 1
}
</script>

<template>
  <section
    v-if="!error"
    class="custom-container"
  >
    <div class="shadow-lg card bg-kimberly-300/30">
      <div class="justify-center p-2 card-title">
        Top Performance
      </div>
      <div class="p-4 card-body">
        <div
          v-for="i, index in bp"
          :key="`bests-${index}`"
          class="score"
        >
          <app-score :score="i" :mode="mode" :ruleset="ruleset" :ranking-system="rankingSystem" />
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
