<script setup lang="ts">
import type { RankingSystemScore } from '~/types/score'
import type { LeaderboardPPRankingSystem, LeaderboardRankingSystem, LeaderboardScoreRankingSystem, Mode, Ruleset } from '~/types/common'
import {
  leaderboardScoreRankingSystems,
  ppRankingSystems,
} from '~/types/defs'

import type { RankingStatus } from '~/types/beatmap'

const props = withDefaults(
  defineProps<{
    score?: RankingSystemScore<
      unknown,
      unknown,
      Mode,
      LeaderboardRankingSystem
    >
    mode: Mode
    ruleset: Ruleset
    rankingSystem: LeaderboardRankingSystem
    useIntl?: boolean
  }>(),
  {
    useIntl: true,
  }
)

const rankingStatusIconMapping: Partial<Record<RankingStatus, string>> = {
  approved: 'line-md:circle-to-confirm-circle-transition',
  ranked: 'line-md:chevron-small-triple-up',
  pending: 'line-md:alert',
  loved: 'line-md:heart-filled',
  qualified: 'line-md:confirm',
}

const numberFmt = createAddCommasFormatter()
const beatmap = computed(() => {
  if (!props.score) {
    return
  }
  if (!beatmapIsVisible(props.score.beatmap)) {
    return
  }
  return props.score.beatmap
})
const meta = computed(
  (): {
    artist: string
    title: string
  } | void => {
    if (!beatmap.value) {
      return
    }
    if (!beatmapIsVisible(beatmap.value)) {
      return
    }

    if (props.useIntl) {
      return beatmap.value.beatmapset.meta.intl
    }
    else {
      return {
        artist:
          beatmap.value.beatmapset.meta.artist
          || beatmap.value.beatmapset.meta.intl.artist,
        title:
          beatmap.value.beatmapset.meta.title
          || beatmap.value.beatmapset.meta.intl.title,
      }
    }
  }
)
</script>

<template>
  <div v-if="score" class="score">
    <div class="flex justify-between">
      <div class="flex min-w-0 gap-4">
        <div class="hidden md:block">
          <img
            v-if=" beatmap
              && beatmapIsVisible(beatmap)
              && beatmap.beatmapset.source === 'bancho'"
            :src="beatmap.beatmapset.assets['list@2x']"
            :alt="beatmap.beatmapset.meta.title"
            :onerror="placeholder"
            class="object-cover w-20 h-16 rounded-xl shadow-md"
          >
          <div v-else class="w-20 h-16">
            <icon name="clarity:unknown-status-line" size="100%" />
          </div>
        </div>
        <div class="flex flex-col min-w-0">
          <template v-if="beatmap && beatmapIsVisible(beatmap)">
            <router-link
              :to="{
                name: 'beatmapset-id',
                params: {
                  id: beatmap.beatmapset.id as string,
                },
                query: {
                  beatmap: beatmap.id as string,
                  mode: props.mode,
                  ruleset: props.ruleset,
                  rank: ['totalScore', 'rankedScore'].includes(
                    props.rankingSystem,
                  )
                    ? 'score'
                    : props.rankingSystem,
                },
              }" class="truncate"
            >
              <template v-if="meta">
                <span class="text-sm truncate md:text-md lg:text-lg font-bold flex gap-2 items-center">
                  <!-- eslint-disable-next-line vue/no-extra-parens -->
                  <icon v-if="beatmap.status in rankingStatusIconMapping" :name="(rankingStatusIconMapping[beatmap.status] as string)" :aria-label="beatmap.status" />
                  {{ meta.artist }} - {{ meta.title }}</span>
              </template>
            </router-link>
          </template>
          <div v-else>
            Unknown Beatmap
          </div>
          <div class="flex text-xs gap-2 md:text-sm lg:text-md flex-wrap">
            <div class="flex gap-2">
              <span v-if="beatmap" class="font-semibold">
                {{ beatmap.version }}
              </span>
              <span class="font-light">
                {{ score.mods.join(", ") || "NoMod" }}
              </span>
            </div>
            <div class="flex">
              <div v-if="beatmap" class="font-semibold">
                {{ score.maxCombo }} / {{ beatmap.properties.maxCombo }}
              </div>
              <div v-else class="font-semibold">
                {{ score.maxCombo }}
              </div>
              <div class="font-light">
                x
              </div>
            </div>
          </div>
          <div class="mt-auto map-date">
            <time class="text-xs italic lg:text-sm font-extralight">
              {{ score.playedAt.toLocaleString() }}
            </time>
          </div>
        </div>
      </div>
      <div class="flex gap-4">
        <div class="flex flex-col">
          <div class="flex items-center justify-end flex-grow text-lg md:text-xl lg:text-2xl">
            <template v-if="(ppRankingSystems).includes(props.rankingSystem as LeaderboardPPRankingSystem)">
              <div class="font-bold font-mono">
                {{ score.pp.toFixed(2) }}
              </div>
              <span class="font-light">pp</span>
            </template>
            <template v-else-if="(leaderboardScoreRankingSystems).includes(props.rankingSystem as LeaderboardScoreRankingSystem)">
              <div class="font-bold font-mono">
                {{ numberFmt(score.score) }}
              </div>
            </template>
          </div>
          <div class="flex mt-auto text-xs md:text-md lg:text-md whitespace-nowrap justify-end">
            <b class="font-mono">{{ score.accuracy.toFixed(2) }}</b>
            <div class="text-light">
              % Acc
            </div>
          </div>
        </div>
        <div class="flex items-center justify-center">
          <div class="text-5xl font-mono w-16 text-center">
            {{ score.grade }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.score {
  @apply py-2;
}

.score + .score {
  @apply border-t-2 border-gbase-300/50;
}
</style>
