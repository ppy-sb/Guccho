<script setup lang="ts">
import type { inferRouterOutputs } from '@trpc/server'
import type { Ref } from 'vue'
import type { IdType } from '$/config'
import type { AppRouter } from '~/server/trpc/routers'
import type { Mode, PPRankingSystem, RankingSystem, Ruleset } from '~/types/common'
import type { BaseUser } from '~/types/user'
const { $client } = useNuxtApp()
const user = inject('user') as Ref<BaseUser<IdType>>
const mode = inject('mode') as Ref<Mode>
const ruleset = inject('ruleset') as Ref<Ruleset>
const rankingSystem = inject('rankingSystem') as Ref<RankingSystem>
const bp = ref<inferRouterOutputs<AppRouter>['user']['best']>([])
const show = ref(false)
if (user && mode && ruleset && ['ppv2', 'ppv1'].includes(rankingSystem?.value as string)) {
  show.value = true
  const rtn = await $client.user.best.query({
    handle: user.value.id,
    mode: mode.value,
    ruleset: ruleset.value,
    rankingSystem: rankingSystem?.value as PPRankingSystem,
    page: 0,
  })
  if (rtn)
    bp.value = rtn
}
</script>

<template>
  <section
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
    </div>
  </section>
</template>
