<script setup lang="ts">
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import type { RulesetScore } from '~/types/score'
import type { Mode, PPRankingSystem, RankingSystem, Ruleset } from '~/types/common'
import { assertBeatmapIsVisible } from '~/utils/map'
import {
  createScoreFormatter,
} from '~/common/varkaUtils'
import type { UserEssential } from '~~/src/types/user'
defineProps<{
  score: RulesetScore<string, string, Mode, Ruleset, PPRankingSystem> & { user: UserEssential<unknown> }
  rankingSystem: RankingSystem
}>()

const { addToLibrary } = useFAIconLib()

addToLibrary(faEllipsisH)

const { assertHasRankingSystem, assertHasRuleset } = useAdapterConfig()

const scoreFmt = createScoreFormatter({ notation: undefined })
</script>

<template>
  <div>
    <template v-if="assertBeatmapIsVisible(score.beatmap)">
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
          <template v-else-if="rankingSystem === 'ppv2' && assertHasRuleset(score.mode, score.ruleset) && assertHasRankingSystem(score.mode, score.ruleset, 'ppv2')">
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