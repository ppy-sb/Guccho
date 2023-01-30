<script setup lang="ts">
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import type { RulesetScore } from '~/types/score'
import type { Mode, PPRankingSystem, RankingSystem, Ruleset } from '~/types/common'
import { assertBeatmapIsVisible } from '~/utils/map'
import {
  createScoreFormatter,
} from '~/common/varkaUtils'
defineProps<{
  score: RulesetScore<string, string, Mode, Ruleset, PPRankingSystem>
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
          <div class="flex gap-2 items-baseline">
            <div class="text-3xl font-bold">
              {{ score.beatmap.beatmapset.meta.intl.title }}
            </div>
            <div class="flex gap-1 items-baseline">
              <span class="font-light">by</span>
              <span class="text-2xl font-semibold">
                {{ score.beatmap.beatmapset.meta.intl.artist }}
              </span>
            </div>
          </div>

          <div class="flex gap-1 items-baseline">
            <span class="text-2xl font-bold">{{ score.beatmap.version }}</span>
            <span class="font-light">mapped by</span>
            <span class="text-xl font-semibold">{{ score.beatmap.creator }}</span>
          </div>
        </div>
        <div class="ml-auto">
          <t-button variant="ghost" size="sm">
            <font-awesome-icon icon="fas fa-ellipsis-h" size="2xl" />
          </t-button>
        </div>
      </div>
      <div class="grid gap-2 grid-cols-1 grid-rows-auto">
        <div class="p-8 flex gap-2 items-baseline">
          <template v-if="rankingSystem === 'score'">
            <span class="text-5xl">{{ scoreFmt(score.score) }}</span>
          </template>
          <template v-else-if="rankingSystem === 'ppv2' && assertHasRuleset(score.mode, score.ruleset) && assertHasRankingSystem(score.mode, score.ruleset, 'ppv2')">
            <span class="text-5xl">{{ scoreFmt(score.ppv2.pp) }}</span>
            <span class="text-3xl">pp</span>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>
