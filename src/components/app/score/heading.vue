<script setup lang="ts">
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import type { inferRouterOutputs } from '@trpc/server'
import { beatmapIsVisible } from '~/utils'
import {
  createScoreFormatter,
} from '~/common/varkaUtils'
import type { AppRouter } from '~/server/trpc/routers'
import type { RankingSystem } from '~/types/common'

type RouterOutput = inferRouterOutputs<AppRouter>

type Score = NonNullable<RouterOutput['score']['id']>
defineProps<{
  score: Score
  rankingSystem: RankingSystem
}>()

const { addToLibrary } = useFAIconLib()

addToLibrary(faEllipsisH)

const { hasRankingSystem, hasRuleset } = useAdapterConfig()

const scoreFmt = createScoreFormatter({ notation: undefined })
</script>

<template>
  <!-- TODO score design -->
  <div>
    <template v-if="beatmapIsVisible(score.beatmap)">
      <div class="flex">
        <div class="flex flex-col gap-2">
          <div class="flex gap-2 items-baseline flex-wrap">
            <div class="text-3xl font-bold">
              {{ score.beatmap.beatmapset.meta.intl.title }}
            </div>
            <div class="flex gap-1 items-baseline">
              <span class="font-light">by</span>
              <span class="text-2xl font-semibold">
                {{ score.beatmap.beatmapset.meta.intl.artist }}
              </span>
            </div>
            <div class="divider divider-horizontal" />
            <span class="text-2xl font-bold">{{ score.beatmap.version }}</span>
            <span class="font-light">mapped by</span>
            <span class="text-xl font-semibold">{{ score.beatmap.creator }}</span>
          </div>

          <div class="flex gap-1 items-baseline">
            <div class="flex items-center gap-1">
              <img class="mask mask-squircle" width="30" :src="score.user.avatarSrc" alt="">
              <nuxt-link
                :to="{
                  name: 'user-handle',
                  params: {
                    handle: `@${score.user.safeName}`,
                  },
                }" class="text-4xl font-bold underline decoration-sky-500"
              >
                {{ score.user.name }}
              </nuxt-link>
            </div>
            <span class="font-light">played at</span>
            <span class="text-xl font-semibold">{{ score.playedAt.toLocaleString() }}</span>
          </div>
        </div>
        <div class="ml-auto">
          <t-button variant="ghost" size="sm">
            <font-awesome-icon icon="fas fa-ellipsis-h" size="2xl" />
          </t-button>
        </div>
      </div>
      <div class="flex flex-col md:flex-row w-full justify-between">
        <div class="p-8 flex gap-2 items-baseline">
          <template v-if="rankingSystem === 'score'">
            <span class="text-5xl">{{ scoreFmt(score.score) }}</span>
          </template>
          <template v-else-if="rankingSystem === 'ppv2' && hasRuleset(score.mode, score.ruleset) && hasRankingSystem(score.mode, score.ruleset, 'ppv2')">
            <span class="text-5xl">{{ scoreFmt(score.ppv2.pp) }}</span>
            <span class="text-3xl">pp</span>
          </template>
        </div>
        <div class="p-8 text-8xl">
          {{ score.grade }}
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>
